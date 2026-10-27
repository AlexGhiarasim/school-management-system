import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface.js';
import { PrismaService } from '../../../database/prisma.service.js';
import type { JwtPayload } from '../interfaces/jwt-payload.interface.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        passwordChangedAt: true,
        teacher: { select: { id: true } },
        student: { select: { id: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    // A password change signs out every session opened before it.
    const changedAt = user.passwordChangedAt;
    if (
      changedAt &&
      (payload.iat ?? 0) <= Math.floor(changedAt.getTime() / 1000)
    ) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      teacherId: user.teacher?.id ?? null,
      studentId: user.student?.id ?? null,
    };
  }
}
