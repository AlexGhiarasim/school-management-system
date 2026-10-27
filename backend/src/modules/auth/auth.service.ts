import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import { hashPassword } from '../../common/utils/password.util.js';
import { PrismaService } from '../../database/prisma.service.js';
import { Prisma, Role } from '../../generated/prisma/client.js';
import { MailService } from '../mail/mail.service.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';
import type { CurrentUserDto } from './dto/current-user.dto.js';
import type { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import type { ResetPasswordDto } from './dto/reset-password.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { LoginResponseDto } from './dto/login-response.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

const INVALID_CREDENTIALS = 'Invalid email or password';
const EMAIL_TAKEN = 'Email is already registered';
const WRONG_CURRENT_PASSWORD = 'The current password is incorrect';
const INVALID_RESET_TOKEN = 'The reset link is invalid or has expired';
const RESET_TOKEN_MINUTES = 60;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
const DUMMY_HASH =
  '$2b$10$dlQ4G7oVEqL36vksBRJ5See2vfWjJgxfZupUeSrCQnLIo0mNkuHRW';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async login({ email, password }: LoginDto): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    const passwordMatches = await bcrypt.compare(
      password,
      user?.passwordHash ?? DUMMY_HASH,
    );

    if (!user || !user.isActive || !passwordMatches) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    return this.issueToken(user);
  }

  async register({
    email,
    password,
    dateOfBirth,
    ...profile
  }: RegisterDto): Promise<LoginResponseDto> {
    try {
      const student = await this.prisma.student.create({
        data: {
          ...profile,
          dateOfBirth: new Date(dateOfBirth),
          user: {
            create: {
              email,
              passwordHash: await hashPassword(password),
              role: Role.STUDENT,
            },
          },
        },
        include: { user: true },
      });

      return this.issueToken(student.user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(EMAIL_TAKEN);
      }

      throw error;
    }
  }

  async changePassword(
    { id }: AuthenticatedUser,
    { currentPassword, newPassword }: ChangePasswordDto,
  ): Promise<LoginResponseDto> {
    const current = await this.prisma.user.findUniqueOrThrow({ where: { id } });

    if (!(await bcrypt.compare(currentPassword, current.passwordHash))) {
      throw new ForbiddenException(WRONG_CURRENT_PASSWORD);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: await hashPassword(newPassword),
        passwordChangedAt: new Date(),
      },
    });

    // The other sessions are signed out, so this one gets a fresh token.
    return this.issueToken(user);
  }

  async forgotPassword({
    email,
    language = 'ro',
  }: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) return;

    const token = randomBytes(32).toString('hex');

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      }),
      this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + RESET_TOKEN_MINUTES * 60_000),
        },
      }),
    ]);

    const link = `${this.configService.getOrThrow<string>('APP_URL')}/reset-password?token=${token}`;

    // Not awaited, so the response time does not depend on the mail server.
    void this.mailService.sendPasswordReset(
      user.email,
      link,
      RESET_TOKEN_MINUTES,
      language,
    );
  }

  async resetPassword({ token, password }: ResetPasswordDto): Promise<void> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { select: { isActive: true } } },
    });
    const now = new Date();

    if (
      !record ||
      record.usedAt !== null ||
      record.expiresAt < now ||
      !record.user.isActive
    ) {
      throw new BadRequestException(INVALID_RESET_TOKEN);
    }

    const passwordHash = await hashPassword(password);

    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.passwordResetToken.updateMany({
        where: { id: record.id, usedAt: null },
        data: { usedAt: now },
      });

      if (count === 0) {
        throw new BadRequestException(INVALID_RESET_TOKEN);
      }

      await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash, passwordChangedAt: now },
      });
      await tx.passwordResetToken.updateMany({
        where: { userId: record.userId, usedAt: null },
        data: { usedAt: now },
      });
    });
  }

  private async issueToken(user: {
    id: number;
    email: string;
    role: Role;
    passwordChangedAt?: Date | null;
  }): Promise<LoginResponseDto> {
    // The token must be newer than the last password change, even when both
    // happen within the same second.
    const issuedAt = Math.max(
      Math.floor(Date.now() / 1000),
      user.passwordChangedAt
        ? Math.floor(user.passwordChangedAt.getTime() / 1000) + 1
        : 0,
    );
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: issuedAt,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async getCurrentUser({ id }: AuthenticatedUser): Promise<CurrentUserDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: { teacher: true, student: true },
    });

    const profile = user.teacher ?? user.student;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: profile
        ? {
            id: profile.id,
            firstName: profile.firstName,
            lastName: profile.lastName,
          }
        : null,
    };
  }
}
