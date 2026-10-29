import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CacheService } from '../../cache/cache.service.js';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import {
  paginate,
  paginationArgs,
} from '../../common/utils/pagination.util.js';
import { PrismaService } from '../../database/prisma.service.js';
import { Prisma, Role } from '../../generated/prisma/client.js';
import type { AssignTeachingDto } from './dto/assign-teaching.dto.js';
import type { CreateClassDto } from './dto/create-class.dto.js';
import type { ListClassesQueryDto } from './dto/list-classes-query.dto.js';
import type { UpdateClassDto } from './dto/update-class.dto.js';
import type { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { buildRoster, buildStatistics } from '../statistics/statistics.util.js';

const classInclude = {
  teacher: { select: { id: true, firstName: true, lastName: true } },
  _count: { select: { students: true } },
} satisfies Prisma.ClassInclude;

const teachingSelect = {
  id: true,
  subject: { select: { id: true, name: true } },
  teacher: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.TeachingAssignmentSelect;

type ClassWithRelations = Prisma.ClassGetPayload<{
  include: typeof classInclude;
}>;

function toResponse({ _count, ...schoolClass }: ClassWithRelations) {
  return { ...schoolClass, studentCount: _count.students };
}

@Injectable()
export class ClassesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(query: ListClassesQueryDto) {
    const where: Prisma.ClassWhereInput = query.search
      ? { name: { contains: query.search } }
      : {};

    const [classes, total] = await this.prisma.$transaction([
      this.prisma.class.findMany({
        where,
        include: classInclude,
        orderBy: { name: 'asc' },
        ...paginationArgs(query),
      }),
      this.prisma.class.count({ where }),
    ]);

    return paginate(classes.map(toResponse), total, query);
  }

  async findOne(id: number) {
    const schoolClass = await this.prisma.class.findUnique({
      where: { id },
      include: classInclude,
    });

    if (!schoolClass) {
      throw new NotFoundException(`Class ${id} not found`);
    }

    return toResponse(schoolClass);
  }

  async create({ teacherId, ...data }: CreateClassDto) {
    if (teacherId !== undefined) {
      await this.assertTeacherExists(teacherId);
      await this.assertNotClassTeacher(teacherId);
    }

    const schoolClass = await this.prisma.class.create({
      data: { ...data, teacherId },
      include: classInclude,
    });

    return toResponse(schoolClass);
  }

  async update(id: number, dto: UpdateClassDto) {
    const schoolClass = await this.prisma.class.update({
      where: { id },
      data: dto,
      include: classInclude,
    });

    return toResponse(schoolClass);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.class.delete({ where: { id } });
  }

  async assignTeacher(id: number, teacherId: number | null) {
    if (teacherId !== null) {
      await this.assertTeacherExists(teacherId);
      await this.assertNotClassTeacher(teacherId, id);
    }

    const schoolClass = await this.prisma.class.update({
      where: { id },
      data: { teacherId },
      include: classInclude,
    });

    return toResponse(schoolClass);
  }

  // Who teaches which subject in the class. A teacher can grade only the
  // subjects that are assigned to them here.
  async findTeaching(id: number) {
    await this.assertClassExists(id);

    return this.listTeaching(id);
  }

  async addTeaching(id: number, { teacherId, subjectId }: AssignTeachingDto) {
    await this.assertClassExists(id);
    await this.assertTeacherExists(teacherId);

    const subjects = await this.prisma.subject.count({
      where: { id: subjectId },
    });

    if (subjects === 0) {
      throw new NotFoundException(`Subject ${subjectId} not found`);
    }

    const taken = await this.prisma.teachingAssignment.count({
      where: { classId: id, subjectId },
    });

    if (taken > 0) {
      throw new ConflictException(
        'The subject already has a teacher in this class',
      );
    }

    return this.prisma.teachingAssignment.create({
      data: { classId: id, teacherId, subjectId },
      select: teachingSelect,
    });
  }

  async removeTeaching(id: number, assignmentId: number): Promise<void> {
    const { count } = await this.prisma.teachingAssignment.deleteMany({
      where: { id: assignmentId, classId: id },
    });

    if (count === 0) {
      throw new NotFoundException(`Assignment ${assignmentId} not found`);
    }
  }

  // Everything the class teacher needs to follow the class: the statistics of
  // the class, how every student is doing and who teaches what.
  async findOverview(id: number, user: AuthenticatedUser) {
    const schoolClass = await this.prisma.class.findUnique({
      where: { id },
      include: classInclude,
    });

    if (!schoolClass) {
      throw new NotFoundException(`Class ${id} not found`);
    }

    this.assertClassTeacher(schoolClass, user);

    // The class and who may see it are read every time. Only the heavy part,
    // the grades of the whole class, comes from the cache.
    const details = await this.cache.remember(
      `class-overview:${id}`,
      async () => {
        const [students, grades, teaching] = await Promise.all([
          this.prisma.student.findMany({
            where: { classId: id },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              class: { select: { id: true, name: true } },
            },
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
          }),
          this.prisma.grade.findMany({
            where: { student: { classId: id } },
            select: {
              value: true,
              date: true,
              studentId: true,
              subject: { select: { id: true, name: true } },
            },
          }),
          this.listTeaching(id),
        ]);

        const { byClass: _byClass, ...statistics } = buildStatistics(
          students,
          grades,
        );

        return {
          statistics,
          students: buildRoster(students, grades),
          teaching,
        };
      },
    );

    return { ...toResponse(schoolClass), ...details };
  }

  private assertClassTeacher(
    schoolClass: { teacherId: number | null },
    user: AuthenticatedUser,
  ): void {
    if (
      user.role === Role.TEACHER &&
      schoolClass.teacherId !== user.teacherId
    ) {
      throw new ForbiddenException('Only the class teacher can see this');
    }
  }

  private listTeaching(id: number) {
    return this.prisma.teachingAssignment.findMany({
      where: { classId: id },
      select: teachingSelect,
      orderBy: { subject: { name: 'asc' } },
    });
  }

  private async assertClassExists(id: number): Promise<void> {
    const count = await this.prisma.class.count({ where: { id } });

    if (count === 0) {
      throw new NotFoundException(`Class ${id} not found`);
    }
  }

  private async assertCanSee(id: number, user: AuthenticatedUser) {
    const teacherId = user.teacherId ?? -1;
    const schoolClass = await this.prisma.class.findUnique({
      where: { id },
      include: {
        assignments: { where: { teacherId }, select: { id: true }, take: 1 },
      },
    });

    if (!schoolClass) {
      throw new NotFoundException(`Class ${id} not found`);
    }

    if (
      user.role === Role.TEACHER &&
      schoolClass.teacherId !== teacherId &&
      schoolClass.assignments.length === 0
    ) {
      throw new ForbiddenException('You do not teach this class');
    }
  }

  async findStudents(
    id: number,
    query: PaginationQueryDto,
    user: AuthenticatedUser,
  ) {
    await this.assertCanSee(id, user);

    const where = { classId: id };

    const [students, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          dateOfBirth: true,
          user: { select: { email: true } },
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        ...paginationArgs(query),
      }),
      this.prisma.student.count({ where }),
    ]);

    const data = students.map(({ user, ...student }) => ({
      ...student,
      email: user.email,
    }));

    return paginate(data, total, query);
  }

  // A teacher can be the class teacher of a single class.
  private async assertNotClassTeacher(
    teacherId: number,
    exceptClassId?: number,
  ): Promise<void> {
    const count = await this.prisma.class.count({
      where: {
        teacherId,
        ...(exceptClassId !== undefined && { id: { not: exceptClassId } }),
      },
    });

    if (count > 0) {
      throw new ConflictException('The teacher already leads another class');
    }
  }

  private async assertTeacherExists(teacherId: number): Promise<void> {
    const count = await this.prisma.teacher.count({ where: { id: teacherId } });

    if (count === 0) {
      throw new NotFoundException(`Teacher ${teacherId} not found`);
    }
  }
}
