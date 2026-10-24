import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import type { PrismaService } from '../../database/prisma.service.js';
import { Role } from '../../generated/prisma/enums.js';
import { GradesService } from './grades.service.js';

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

const storedGrade = {
  id: 100,
  value: 9,
  date: new Date('2026-10-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
  studentId: 7,
  teacherId: 5,
  subjectId: 3,
  subject: { id: 3, name: 'Mathematics' },
  student: { id: 7, firstName: 'Ana', lastName: 'Popa' },
  teacher: { id: 5, firstName: 'Laura', lastName: 'Marin' },
};

function createPrisma() {
  return {
    student: { count: vi.fn() },
    subject: { count: vi.fn() },
    grade: {
      create: vi.fn().mockResolvedValue(storedGrade),
      update: vi.fn().mockResolvedValue(storedGrade),
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    $transaction: vi.fn((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
  };
}

describe('GradesService', () => {
  let prisma: ReturnType<typeof createPrisma>;
  let service: GradesService;

  beforeEach(() => {
    prisma = createPrisma();
    service = new GradesService(prisma as unknown as PrismaService);
    prisma.subject.count.mockResolvedValue(1);
  });

  describe('create', () => {
    const dto = { studentId: 7, subjectId: 3, value: 9 };

    it('lets a teacher grade a student from their own class', async () => {
      prisma.student.count.mockResolvedValue(1);

      await service.create(dto, teacher);

      expect(prisma.grade.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ studentId: 7, teacherId: 5 }),
        }),
      );
    });

    it('checks the student against the classes of the teacher', async () => {
      prisma.student.count.mockResolvedValue(1);

      await service.create(dto, teacher);

      expect(prisma.student.count).toHaveBeenLastCalledWith({
        where: { id: 7, class: { teacherId: 5 } },
      });
    });

    it('rejects a student outside the classes of the teacher', async () => {
      prisma.student.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);

      await expect(service.create(dto, teacher)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prisma.grade.create).not.toHaveBeenCalled();
    });

    it('reports an unknown student to a teacher as not found', async () => {
      prisma.student.count.mockResolvedValue(0);

      await expect(service.create(dto, teacher)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('lets an admin grade any student without a teacher', async () => {
      prisma.student.count.mockResolvedValue(1);

      await service.create(dto, admin);

      expect(prisma.grade.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ teacherId: null }),
        }),
      );
    });

    it('rejects an unknown subject', async () => {
      prisma.subject.count.mockResolvedValue(0);

      await expect(service.create(dto, admin)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.grade.create).not.toHaveBeenCalled();
    });

    it('formats the date as a plain date', async () => {
      prisma.student.count.mockResolvedValue(1);

      const result = await service.create(dto, admin);

      expect(result.date).toBe('2026-10-01');
    });
  });

  describe('update', () => {
    it('rejects an unknown grade', async () => {
      prisma.grade.findUnique.mockResolvedValue(null);

      await expect(
        service.update(1, { value: 5 }, teacher),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lets a teacher edit a grade they gave', async () => {
      prisma.grade.findUnique.mockResolvedValue({
        ...storedGrade,
        teacherId: 5,
      });

      await service.update(100, { value: 10 }, teacher);

      expect(prisma.grade.update).toHaveBeenCalled();
    });

    it('rejects a teacher editing a grade given by someone else', async () => {
      prisma.grade.findUnique.mockResolvedValue({
        ...storedGrade,
        teacherId: 6,
      });

      await expect(
        service.update(100, { value: 10 }, teacher),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.grade.update).not.toHaveBeenCalled();
    });

    it('rejects a teacher editing a grade given by an admin', async () => {
      prisma.grade.findUnique.mockResolvedValue({
        ...storedGrade,
        teacherId: null,
      });

      await expect(
        service.update(100, { value: 10 }, teacher),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lets an admin edit any grade', async () => {
      prisma.grade.findUnique.mockResolvedValue({
        ...storedGrade,
        teacherId: 6,
      });

      await service.update(100, { value: 10 }, admin);

      expect(prisma.grade.update).toHaveBeenCalled();
    });

    it('rejects an unknown subject on update', async () => {
      prisma.grade.findUnique.mockResolvedValue(storedGrade);
      prisma.subject.count.mockResolvedValue(0);

      await expect(
        service.update(100, { subjectId: 99 }, admin),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findAll', () => {
    const query = { page: 1, limit: 20 };

    it('limits a teacher to students from their own classes', async () => {
      await service.findAll(query, teacher);

      expect(prisma.grade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            student: { class: { teacherId: 5 } },
          }),
        }),
      );
    });

    it('rejects a teacher asking for a student of another class', async () => {
      prisma.student.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);

      await expect(
        service.findAll({ ...query, studentId: 7 }, teacher),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.grade.findMany).not.toHaveBeenCalled();
    });

    it('does not restrict an admin to any class', async () => {
      await service.findAll(query, admin);

      expect(prisma.grade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { student: {} } }),
      );
    });

    it('applies the subject and student filters', async () => {
      await service.findAll({ ...query, subjectId: 3, studentId: 7 }, admin);

      expect(prisma.grade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { subjectId: 3, studentId: 7, student: {} },
        }),
      );
    });
  });

  describe('findOwn', () => {
    const student: AuthenticatedUser = {
      id: 20,
      email: 'student@school.test',
      role: Role.STUDENT,
      teacherId: null,
      studentId: 7,
    };

    it('reads only the grades of the authenticated student', async () => {
      await service.findOwn(student);

      expect(prisma.grade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { studentId: 7 } }),
      );
    });

    it('returns the average and the grades', async () => {
      prisma.grade.findMany.mockResolvedValue([
        { ...storedGrade, value: 10 },
        { ...storedGrade, id: 101, value: 8 },
      ]);

      const result = await service.findOwn(student);

      expect(result.average).toBe(9);
      expect(result.bySubject).toHaveLength(1);
      expect(result.grades).toHaveLength(2);
    });
  });
});
