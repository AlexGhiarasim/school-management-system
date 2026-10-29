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
  const prisma = {
    student: { findUnique: vi.fn().mockResolvedValue({ classId: 2 }) },
    subject: { count: vi.fn() },
    class: {
      findMany: vi.fn().mockResolvedValue([{ id: 2 }]),
      count: vi.fn().mockResolvedValue(1),
    },
    teachingAssignment: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([{ classId: 3, subjectId: 4 }]),
    },
    grade: {
      create: vi.fn().mockResolvedValue(storedGrade),
      update: vi.fn().mockResolvedValue(storedGrade),
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      delete: vi.fn().mockResolvedValue(storedGrade),
    },
    gradeAudit: { create: vi.fn().mockResolvedValue({}) },
    // Supports both forms: a list of queries and a callback.
    $transaction: vi.fn(
      (operations: Promise<unknown>[] | ((tx: unknown) => unknown)) =>
        typeof operations === 'function'
          ? operations(prisma)
          : Promise.all(operations),
    ),
  };

  return prisma;
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

    it('lets a teacher grade a subject they teach in the class', async () => {
      await service.create(dto, teacher);

      expect(prisma.teachingAssignment.count).toHaveBeenCalledWith({
        where: { teacherId: 5, classId: 2, subjectId: 3 },
      });
      expect(prisma.grade.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ studentId: 7, teacherId: 5 }),
        }),
      );
    });

    it('rejects a subject the teacher does not teach in the class', async () => {
      prisma.teachingAssignment.count.mockResolvedValue(0);

      await expect(service.create(dto, teacher)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prisma.grade.create).not.toHaveBeenCalled();
    });

    it('reports an unknown student as not found', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(service.create(dto, teacher)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('lets an admin grade any student without a teacher', async () => {
      await service.create(dto, admin);

      expect(prisma.teachingAssignment.count).not.toHaveBeenCalled();

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
      const result = await service.create(dto, admin);

      expect(result.date).toBe('2026-10-01');
    });

    it('logs the new grade with the user who gave it', async () => {
      await service.create(dto, teacher);

      expect(prisma.gradeAudit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'CREATED',
          actorId: 10,
          gradeId: 100,
          oldValue: null,
          newValue: 9,
          studentName: 'Ana Popa',
          subjectName: 'Mathematics',
        }),
      });
    });
  });

  describe('update', () => {
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

    it('logs the old and the new value', async () => {
      prisma.grade.findUnique.mockResolvedValue({ ...storedGrade, value: 6 });

      await service.update(100, { value: 9 }, admin);

      expect(prisma.gradeAudit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'UPDATED',
          actorId: 1,
          oldValue: 6,
          newValue: 9,
        }),
      });
    });

    it('rejects an unknown subject on update', async () => {
      prisma.grade.findUnique.mockResolvedValue(storedGrade);
      prisma.subject.count.mockResolvedValue(0);

      await expect(
        service.update(100, { subjectId: 99 }, admin),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the grade and logs what it was', async () => {
      prisma.grade.findUnique.mockResolvedValue(storedGrade);

      await service.remove(100, admin);

      expect(prisma.grade.delete).toHaveBeenCalledWith({ where: { id: 100 } });
      expect(prisma.gradeAudit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'DELETED',
          oldValue: 9,
          newValue: null,
        }),
      });
    });

    it('rejects an unknown grade', async () => {
      prisma.grade.findUnique.mockResolvedValue(null);

      await expect(service.remove(1, admin)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.grade.delete).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const query = { page: 1, limit: 20 };

    it('shows a teacher the whole class they lead and the subjects they teach', async () => {
      await service.findAll(query, teacher);

      expect(prisma.grade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { student: { classId: { in: [2] } } },
              { subjectId: 4, student: { classId: 3 } },
            ],
          },
        }),
      );
    });

    it('rejects a teacher asking for a student of another class', async () => {
      prisma.class.count.mockResolvedValue(0);

      await expect(
        service.findAll({ ...query, studentId: 7 }, teacher),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.grade.findMany).not.toHaveBeenCalled();
    });

    it('does not restrict an admin to any class', async () => {
      await service.findAll(query, admin);

      expect(prisma.grade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('applies the subject and student filters', async () => {
      await service.findAll({ ...query, subjectId: 3, studentId: 7 }, admin);

      expect(prisma.grade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { subjectId: 3, studentId: 7 },
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
