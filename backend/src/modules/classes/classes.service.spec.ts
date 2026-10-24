import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import type { PrismaService } from '../../database/prisma.service.js';
import { Role } from '../../generated/prisma/enums.js';
import { ClassesService } from './classes.service.js';

const teacher: AuthenticatedUser = {
  id: 10,
  email: 'teacher@school.test',
  role: Role.TEACHER,
  teacherId: 5,
  studentId: null,
};

const admin: AuthenticatedUser = {
  id: 1,
  email: 'admin@school.test',
  role: Role.ADMIN,
  teacherId: null,
  studentId: null,
};

const query = { page: 1, limit: 20 };

function createPrisma() {
  return {
    class: { findUnique: vi.fn() },
    teacher: { count: vi.fn() },
    student: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 7,
          firstName: 'Ana',
          lastName: 'Popa',
          dateOfBirth: new Date('2011-03-04'),
          user: { email: 'ana.popa@student.school.test' },
        },
      ]),
      count: vi.fn().mockResolvedValue(1),
    },
    $transaction: vi.fn((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
  };
}

describe('ClassesService', () => {
  let prisma: ReturnType<typeof createPrisma>;
  let service: ClassesService;

  beforeEach(() => {
    prisma = createPrisma();
    service = new ClassesService(prisma as unknown as PrismaService);
  });

  describe('findStudents', () => {
    it('rejects an unknown class', async () => {
      prisma.class.findUnique.mockResolvedValue(null);

      await expect(
        service.findStudents(1, query, admin),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects a teacher who does not teach the class', async () => {
      prisma.class.findUnique.mockResolvedValue({ id: 1, teacherId: 6 });

      await expect(
        service.findStudents(1, query, teacher),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.student.findMany).not.toHaveBeenCalled();
    });

    it('rejects a teacher when the class has no teacher', async () => {
      prisma.class.findUnique.mockResolvedValue({ id: 1, teacherId: null });

      await expect(
        service.findStudents(1, query, teacher),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lets the teacher of the class list its students', async () => {
      prisma.class.findUnique.mockResolvedValue({ id: 1, teacherId: 5 });

      const result = await service.findStudents(1, query, teacher);

      expect(result.meta.total).toBe(1);
      expect(result.data[0]).toMatchObject({
        id: 7,
        email: 'ana.popa@student.school.test',
      });
    });

    it('lets an admin list the students of any class', async () => {
      prisma.class.findUnique.mockResolvedValue({ id: 1, teacherId: 6 });

      const result = await service.findStudents(1, query, admin);

      expect(result.data).toHaveLength(1);
    });
  });

  describe('assignTeacher', () => {
    it('rejects an unknown teacher', async () => {
      prisma.teacher.count.mockResolvedValue(0);

      await expect(service.assignTeacher(1, 99)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
