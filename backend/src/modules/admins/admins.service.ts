import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { Role } from '../../generated/prisma/client.js';

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: {
        id: true,
        email: true,
        isActive: true,
        createdAt: true,
        admin: { select: { firstName: true, lastName: true, phone: true } },
      },
    });

    return users
      .map(({ admin, ...user }) => ({
        ...user,
        firstName: admin?.firstName ?? null,
        lastName: admin?.lastName ?? null,
        phone: admin?.phone ?? null,
      }))
      .sort((a, b) =>
        `${a.lastName ?? a.email} ${a.firstName ?? ''}`.localeCompare(
          `${b.lastName ?? b.email} ${b.firstName ?? ''}`,
        ),
      );
  }
}
