import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import { toDateOnly } from '../../common/utils/date.util.js';
import {
  paginate,
  paginationArgs,
} from '../../common/utils/pagination.util.js';
import { PrismaService } from '../../database/prisma.service.js';
import {
  GradeAuditAction,
  Prisma,
  Role,
} from '../../generated/prisma/client.js';
import type { CreateGradeDto } from './dto/create-grade.dto.js';
import type { ExportGradesQueryDto } from './dto/export-grades-query.dto.js';
import type { ListGradesQueryDto } from './dto/list-grades-query.dto.js';
import type { UpdateGradeDto } from './dto/update-grade.dto.js';
import { auditEntry, hasChanged } from './grade-audit.util.js';
import { toGradesCsv } from './grades-csv.util.js';
import { summarize } from './grades.util.js';

const gradeInclude = {
  subject: { select: { id: true, name: true } },
  student: { select: { id: true, firstName: true, lastName: true } },
  teacher: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.GradeInclude;

type GradeWithRelations = Prisma.GradeGetPayload<{
  include: typeof gradeInclude;
}>;

type GradeFilters = Pick<
  ListGradesQueryDto,
  'studentId' | 'subjectId' | 'classId'
>;

function toResponse({
  date,
  studentId: _studentId,
  teacherId: _teacherId,
  subjectId: _subjectId,
  ...grade
}: GradeWithRelations) {
  return { ...grade, date: toDateOnly(date) };
}

function filterGrades({
  studentId,
  subjectId,
  classId,
}: GradeFilters): Prisma.GradeWhereInput {
  return {
    ...(studentId !== undefined && { studentId }),
    ...(subjectId !== undefined && { subjectId }),
    ...(classId !== undefined && { student: { classId } }),
  };
}

@Injectable()
export class GradesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListGradesQueryDto, user: AuthenticatedUser) {
    const isTeacher = user.role === Role.TEACHER;

    if (isTeacher && query.studentId !== undefined) {
      await this.assertSeesStudent(user.teacherId, query.studentId);
    }

    const where: Prisma.GradeWhereInput = {
      ...filterGrades(query),
      ...(isTeacher && (await this.teacherScope(user.teacherId ?? -1))),
    };

    const [grades, total] = await this.prisma.$transaction([
      this.prisma.grade.findMany({
        where,
        include: gradeInclude,
        orderBy: [{ date: 'desc' }, { id: 'desc' }],
        ...paginationArgs(query),
      }),
      this.prisma.grade.count({ where }),
    ]);

    return paginate(grades.map(toResponse), total, query);
  }

  async exportCsv({ language = 'ro', ...filters }: ExportGradesQueryDto) {
    const grades = await this.prisma.grade.findMany({
      where: filterGrades(filters),
      include: {
        ...gradeInclude,
        student: {
          select: {
            firstName: true,
            lastName: true,
            class: { select: { name: true } },
          },
        },
      },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });

    return toGradesCsv(
      grades.map((grade) => ({
        date: toDateOnly(grade.date),
        className: grade.student.class?.name ?? null,
        student: `${grade.student.lastName} ${grade.student.firstName}`,
        subject: grade.subject.name,
        value: grade.value,
        teacher: grade.teacher
          ? `${grade.teacher.firstName} ${grade.teacher.lastName}`
          : null,
      })),
      language,
    );
  }

  async create(
    { studentId, subjectId, value, date }: CreateGradeDto,
    user: AuthenticatedUser,
  ) {
    await this.assertSubjectExists(subjectId);

    const classId = await this.findStudentClassId(studentId);

    if (user.role === Role.TEACHER) {
      await this.assertTeaches(user.teacherId, classId, subjectId);
    }

    const grade = await this.prisma.$transaction(async (tx) => {
      const created = await tx.grade.create({
        data: {
          studentId,
          subjectId,
          value,
          teacherId: user.teacherId,
          ...(date && { date: new Date(date) }),
        },
        include: gradeInclude,
      });

      await tx.gradeAudit.create({
        data: auditEntry(GradeAuditAction.CREATED, user.id, null, created),
      });

      return created;
    });

    return toResponse(grade);
  }

  async update(
    id: number,
    { subjectId, value, date }: UpdateGradeDto,
    user: AuthenticatedUser,
  ) {
    const existing = await this.prisma.grade.findUnique({
      where: { id },
      include: {
        ...gradeInclude,
        student: {
          select: { id: true, firstName: true, lastName: true, classId: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Grade ${id} not found`);
    }

    if (user.role === Role.TEACHER && existing.teacherId !== user.teacherId) {
      throw new ForbiddenException('You can only edit grades you gave');
    }

    if (subjectId !== undefined) {
      await this.assertSubjectExists(subjectId);

      if (user.role === Role.TEACHER) {
        await this.assertTeaches(
          user.teacherId,
          existing.student.classId,
          subjectId,
        );
      }
    }

    const grade = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.grade.update({
        where: { id },
        data: { subjectId, value, ...(date && { date: new Date(date) }) },
        include: gradeInclude,
      });

      if (hasChanged(existing, updated)) {
        await tx.gradeAudit.create({
          data: auditEntry(
            GradeAuditAction.UPDATED,
            user.id,
            existing,
            updated,
          ),
        });
      }

      return updated;
    });

    return toResponse(grade);
  }

  async remove(id: number, user: AuthenticatedUser): Promise<void> {
    const existing = await this.prisma.grade.findUnique({
      where: { id },
      include: gradeInclude,
    });

    if (!existing) {
      throw new NotFoundException(`Grade ${id} not found`);
    }

    await this.prisma.$transaction([
      this.prisma.grade.delete({ where: { id } }),
      this.prisma.gradeAudit.create({
        data: auditEntry(GradeAuditAction.DELETED, user.id, existing, null),
      }),
    ]);
  }

  async findOwn(user: AuthenticatedUser) {
    const grades = await this.prisma.grade.findMany({
      where: { studentId: user.studentId ?? -1 },
      include: gradeInclude,
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });

    return {
      ...summarize(grades),
      grades: grades.map(toResponse),
    };
  }

  // A class teacher sees every grade of the class. Any other teacher sees only
  // the grades of the subjects they teach in each class.
  private async teacherScope(
    teacherId: number,
  ): Promise<Prisma.GradeWhereInput> {
    const [homeroom, assignments] = await Promise.all([
      this.prisma.class.findMany({
        where: { teacherId },
        select: { id: true },
      }),
      this.prisma.teachingAssignment.findMany({
        where: { teacherId },
        select: { classId: true, subjectId: true },
      }),
    ]);

    return {
      OR: [
        { student: { classId: { in: homeroom.map(({ id }) => id) } } },
        ...assignments.map(({ classId, subjectId }) => ({
          subjectId,
          student: { classId },
        })),
      ],
    };
  }

  private async assertSeesStudent(
    teacherId: number | null,
    studentId: number,
  ): Promise<void> {
    const classId = await this.findStudentClassId(studentId);
    const id = teacherId ?? -1;

    const count = await this.prisma.class.count({
      where: {
        id: classId ?? -1,
        OR: [{ teacherId: id }, { assignments: { some: { teacherId: id } } }],
      },
    });

    if (count === 0) {
      throw new ForbiddenException('The student is not in one of your classes');
    }
  }

  private async assertTeaches(
    teacherId: number | null,
    classId: number | null,
    subjectId: number,
  ): Promise<void> {
    const count = await this.prisma.teachingAssignment.count({
      where: { teacherId: teacherId ?? -1, classId: classId ?? -1, subjectId },
    });

    if (count === 0) {
      throw new ForbiddenException(
        'You do not teach this subject in the class of the student',
      );
    }
  }

  private async findStudentClassId(studentId: number): Promise<number | null> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { classId: true },
    });

    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    return student.classId;
  }

  private async assertSubjectExists(subjectId: number): Promise<void> {
    const count = await this.prisma.subject.count({ where: { id: subjectId } });

    if (count === 0) {
      throw new NotFoundException(`Subject ${subjectId} not found`);
    }
  }
}
