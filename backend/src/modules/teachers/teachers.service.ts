import { Injectable, NotFoundException } from '@nestjs/common';
import { hashPassword } from '../../common/utils/password.util.js';
import {
  paginate,
  paginationArgs,
} from '../../common/utils/pagination.util.js';
import { PrismaService } from '../../database/prisma.service.js';
import { Prisma, Role } from '../../generated/prisma/client.js';
import type { CreateTeacherDto } from './dto/create-teacher.dto.js';
import type { ListTeachersQueryDto } from './dto/list-teachers-query.dto.js';
import type { UpdateTeacherDto } from './dto/update-teacher.dto.js';

const teacherInclude = {
  user: { select: { email: true, isActive: true } },
} satisfies Prisma.TeacherInclude;

type TeacherWithUser = Prisma.TeacherGetPayload<{
  include: typeof teacherInclude;
}>;

function toResponse({ user, userId: _userId, ...teacher }: TeacherWithUser) {
  return { ...teacher, email: user.email, isActive: user.isActive };
}

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListTeachersQueryDto) {
    const where: Prisma.TeacherWhereInput = query.search
      ? {
          OR: [
            { firstName: { contains: query.search } },
            { lastName: { contains: query.search } },
            { user: { email: { contains: query.search } } },
          ],
        }
      : {};

    const [teachers, total] = await this.prisma.$transaction([
      this.prisma.teacher.findMany({
        where,
        include: teacherInclude,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        ...paginationArgs(query),
      }),
      this.prisma.teacher.count({ where }),
    ]);

    return paginate(teachers.map(toResponse), total, query);
  }

  async findOne(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        ...teacherInclude,
        classes: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher ${id} not found`);
    }

    return { ...toResponse(teacher), classes: teacher.classes };
  }

  async create({ email, password, ...profile }: CreateTeacherDto) {
    const teacher = await this.prisma.teacher.create({
      data: {
        ...profile,
        user: {
          create: {
            email,
            passwordHash: await hashPassword(password),
            role: Role.TEACHER,
          },
        },
      },
      include: teacherInclude,
    });

    return toResponse(teacher);
  }

  async update(id: number, { email, ...profile }: UpdateTeacherDto) {
    const teacher = await this.prisma.teacher.update({
      where: { id },
      data: { ...profile, ...(email && { user: { update: { email } } }) },
      include: teacherInclude,
    });

    return toResponse(teacher);
  }

  async remove(id: number): Promise<void> {
    const { count } = await this.prisma.user.deleteMany({
      where: { teacher: { id } },
    });

    if (count === 0) {
      throw new NotFoundException(`Teacher ${id} not found`);
    }
  }

  async findOwnClasses(teacherId: number) {
    const classes = await this.prisma.class.findMany({
      where: {
        OR: [{ teacherId }, { assignments: { some: { teacherId } } }],
      },
      include: {
        _count: { select: { students: true } },
        assignments: {
          where: { teacherId },
          select: { subject: { select: { id: true, name: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return classes.map(({ _count, assignments, ...schoolClass }) => ({
      ...schoolClass,
      studentCount: _count.students,
      isHomeroom: schoolClass.teacherId === teacherId,
      subjects: assignments
        .map(({ subject }) => subject)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }
}
