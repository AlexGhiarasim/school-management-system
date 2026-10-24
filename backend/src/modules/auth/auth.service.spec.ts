import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { PrismaService } from '../../database/prisma.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const findUnique = vi.fn();
  const signAsync = vi.fn().mockResolvedValue('signed-token');
  const service = new AuthService(
    { user: { findUnique } } as unknown as PrismaService,
    { signAsync } as unknown as JwtService,
  );

  const baseUser = {
    id: 1,
    email: 'admin@school.test',
    role: 'ADMIN',
    isActive: true,
    passwordHash: bcrypt.hashSync('Admin123!', 4),
  };

  beforeEach(() => {
    findUnique.mockReset();
  });

  it('returns a token for valid credentials', async () => {
    findUnique.mockResolvedValue(baseUser);

    const result = await service.login({
      email: baseUser.email,
      password: 'Admin123!',
    });

    expect(result.accessToken).toBe('signed-token');
    expect(result.user).toEqual({
      id: 1,
      email: baseUser.email,
      role: 'ADMIN',
    });
    expect(signAsync).toHaveBeenCalledWith({
      sub: 1,
      email: baseUser.email,
      role: 'ADMIN',
    });
  });

  it('rejects a wrong password', async () => {
    findUnique.mockResolvedValue(baseUser);

    await expect(
      service.login({ email: baseUser.email, password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an unknown email', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'nobody@school.test', password: 'Admin123!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an inactive account', async () => {
    findUnique.mockResolvedValue({ ...baseUser, isActive: false });

    await expect(
      service.login({ email: baseUser.email, password: 'Admin123!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
