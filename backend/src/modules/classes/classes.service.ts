import {
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
    }

    const schoolClass = await this.prisma.class.update({
      where: { id },
      data: { teacherId },
      include: classInclude,
    });

    return toResponse(schoolClass);
  }

  async findStudents(
    id: number,
    query: PaginationQueryDto,
    user: AuthenticatedUser,
  ) {
    const schoolClass = await this.prisma.class.findUnique({ where: { id } });

    if (!schoolClass) {
      throw new NotFoundException(`Class ${id} not found`);
    }

    if (
      user.role === Role.TEACHER &&
      schoolClass.teacherId !== user.teacherId
    ) {
      throw new ForbiddenException('You do not teach this class');
    }

    const where = { classId: id };

    const [students, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
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

  private async assertTeacherExists(teacherId: number): Promise<void> {
    const count = await this.prisma.teacher.count({ where: { id: teacherId } });

    if (count === 0) {
      throw new NotFoundException(`Teacher ${teacherId} not found`);
    }
  }
}
