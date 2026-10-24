import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import { PrismaService } from '../../database/prisma.service.js';
import type { CurrentUserDto } from './dto/current-user.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { LoginResponseDto } from './dto/login-response.dto.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

const INVALID_CREDENTIALS = 'Invalid email or password';
const DUMMY_HASH =
  '$2b$10$dlQ4G7oVEqL36vksBRJ5See2vfWjJgxfZupUeSrCQnLIo0mNkuHRW';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
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
