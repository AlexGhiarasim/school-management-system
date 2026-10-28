import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import {
  paginate,
  paginationArgs,
} from '../../common/utils/pagination.util.js';
import { PrismaService } from '../../database/prisma.service.js';
import { Prisma, Role } from '../../generated/prisma/client.js';
import type { CreateClassDto } from './dto/create-class.dto.js';
import type { ListClassesQueryDto } from './dto/list-classes-query.dto.js';
import type { UpdateClassDto } from './dto/update-class.dto.js';
import type { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

const classInclude = {
  teacher: { select: { id: true, firstName: true, lastName: true } },
  _count: { select: { students: true } },
} satisfies Prisma.ClassInclude;

type ClassWithRelations = Prisma.ClassGetPayload<{
  include: typeof classInclude;
}>;

function toResponse({ _count, ...schoolClass }: ClassWithRelations) {
  return { ...schoolClass, studentCount: _count.students };
}

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

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

  // Who teaches which subject in the class. Only the class teacher (and an
  // administrator) can see it.
  async findTeaching(id: number, user: AuthenticatedUser) {
    const schoolClass = await this.prisma.class.findUnique({ where: { id } });

    if (!schoolClass) {
      throw new NotFoundException(`Class ${id} not found`);
    }

    if (
      user.role === Role.TEACHER &&
      schoolClass.teacherId !== user.teacherId
    ) {
      throw new ForbiddenException('Only the class teacher can see this');
    }

    const assignments = await this.prisma.teachingAssignment.findMany({
      where: { classId: id },
      select: {
        subject: { select: { id: true, name: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { subject: { name: 'asc' } },
    });

    return assignments;
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
