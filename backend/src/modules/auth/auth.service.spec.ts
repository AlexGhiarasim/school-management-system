import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { PrismaService } from '../../database/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';
import type { MailService } from '../mail/mail.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const findUnique = vi.fn();
  const createStudent = vi.fn();
  const signAsync = vi.fn().mockResolvedValue('signed-token');
  const registrationEnabled = vi.fn().mockReturnValue(true);
  const service = new AuthService(
    {
      user: { findUnique },
      student: { create: createStudent },
    } as unknown as PrismaService,
    { signAsync } as unknown as JwtService,
    { get: registrationEnabled } as unknown as ConfigService,
    {} as unknown as MailService,
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
      iat: expect.any(Number),
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

  describe('register', () => {
    const dto = {
      firstName: 'Maria',
      lastName: 'Popescu',
      email: 'maria@school.test',
      password: 'Password123',
      dateOfBirth: '2010-05-17',
    };

    beforeEach(() => {
      createStudent.mockReset();
      registrationEnabled.mockReturnValue(true);
    });

    it('refuses to register when public registration is disabled', async () => {
      registrationEnabled.mockReturnValue(false);

      await expect(service.register(dto)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(createStudent).not.toHaveBeenCalled();
    });

    it('creates a student account and returns a token', async () => {
      createStudent.mockResolvedValue({
        user: { id: 9, email: dto.email, role: 'STUDENT' },
      });

      const result = await service.register(dto);

      expect(result.user).toEqual({
        id: 9,
        email: dto.email,
        role: 'STUDENT',
      });
      expect(createStudent.mock.calls[0][0].data.user.create).toMatchObject({
        email: dto.email,
        role: 'STUDENT',
      });
    });

    it('stores a hash, never the plain password', async () => {
      createStudent.mockResolvedValue({
        user: { id: 9, email: dto.email, role: 'STUDENT' },
      });

      await service.register(dto);

      const { passwordHash } = createStudent.mock.calls[0][0].data.user.create;
      expect(passwordHash).not.toBe(dto.password);
      expect(await bcrypt.compare(dto.password, passwordHash)).toBe(true);
    });

    it('reports a duplicate email as a conflict', async () => {
      createStudent.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(service.register(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });
});
