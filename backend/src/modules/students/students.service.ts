import { Injectable, NotFoundException } from '@nestjs/common';
import {
  paginate,
  paginationArgs,
} from '../../common/utils/pagination.util.js';
import { toDateOnly } from '../../common/utils/date.util.js';
import { hashPassword } from '../../common/utils/password.util.js';
import { PrismaService } from '../../database/prisma.service.js';
import { Prisma, Role } from '../../generated/prisma/client.js';
import type { CreateStudentDto } from './dto/create-student.dto.js';
import type { ListStudentsQueryDto } from './dto/list-students-query.dto.js';
import type { UpdateStudentDto } from './dto/update-student.dto.js';

const studentInclude = {
  user: { select: { email: true, isActive: true } },
  class: { select: { id: true, name: true } },
} satisfies Prisma.StudentInclude;

type StudentWithRelations = Prisma.StudentGetPayload<{
  include: typeof studentInclude;
}>;

function toResponse({
  user,
  userId: _userId,
  dateOfBirth,
  ...student
}: StudentWithRelations) {
  return {
    ...student,
    dateOfBirth: toDateOnly(dateOfBirth),
    email: user.email,
    isActive: user.isActive,
  };
}

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListStudentsQueryDto) {
    const where: Prisma.StudentWhereInput = {
      ...(query.classId !== undefined && { classId: query.classId }),
      ...(query.unassigned && { classId: null }),
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search } },
          { lastName: { contains: query.search } },
          { user: { email: { contains: query.search } } },
        ],
      }),
    };

    const [students, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        include: studentInclude,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        ...paginationArgs(query),
      }),
      this.prisma.student.count({ where }),
    ]);

    return paginate(students.map(toResponse), total, query);
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: studentInclude,
    });

    if (!student) {
      throw new NotFoundException(`Student ${id} not found`);
    }

    return toResponse(student);
  }

  async create({
    email,
    password,
    dateOfBirth,
    classId,
    ...profile
  }: CreateStudentDto) {
    if (classId !== undefined) {
      await this.assertClassExists(classId);
    }

    const student = await this.prisma.student.create({
      data: {
        ...profile,
        dateOfBirth: new Date(dateOfBirth),
        ...(classId !== undefined && { class: { connect: { id: classId } } }),
        user: {
          create: {
            email,
            passwordHash: await hashPassword(password),
            role: Role.STUDENT,
          },
        },
      },
      include: studentInclude,
    });

    return toResponse(student);
  }

  async update(
    id: number,
    { email, dateOfBirth, ...profile }: UpdateStudentDto,
  ) {
    const student = await this.prisma.student.update({
      where: { id },
      data: {
        ...profile,
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(email && { user: { update: { email } } }),
      },
      include: studentInclude,
    });

    return toResponse(student);
  }

  async remove(id: number): Promise<void> {
    const { count } = await this.prisma.user.deleteMany({
      where: { student: { id } },
    });

    if (count === 0) {
      throw new NotFoundException(`Student ${id} not found`);
    }
  }

  async assignClass(id: number, classId: number | null) {
    if (classId !== null) {
      await this.assertClassExists(classId);
    }

    const student = await this.prisma.student.update({
      where: { id },
      data: { classId },
      include: studentInclude,
    });

    return toResponse(student);
  }

  findProfile(id: number) {
    return this.findOne(id);
  }

  private async assertClassExists(classId: number): Promise<void> {
    const count = await this.prisma.class.count({ where: { id: classId } });

    if (count === 0) {
      throw new NotFoundException(`Class ${classId} not found`);
    }
  }
}
