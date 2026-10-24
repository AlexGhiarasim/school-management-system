import { Injectable, NotFoundException } from '@nestjs/common';
import {
  paginate,
  paginationArgs,
} from '../../common/utils/pagination.util.js';
import { PrismaService } from '../../database/prisma.service.js';
import type { CreateSubjectDto } from './dto/create-subject.dto.js';
import type { ListSubjectsQueryDto } from './dto/list-subjects-query.dto.js';
import type { UpdateSubjectDto } from './dto/update-subject.dto.js';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListSubjectsQueryDto) {
    const where = query.search ? { name: { contains: query.search } } : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.subject.findMany({
        where,
        orderBy: { name: 'asc' },
        ...paginationArgs(query),
      }),
      this.prisma.subject.count({ where }),
    ]);

    return paginate(data, total, query);
  }

  async findOne(id: number) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });

    if (!subject) {
      throw new NotFoundException(`Subject ${id} not found`);
    }

    return subject;
  }

  create(dto: CreateSubjectDto) {
    return this.prisma.subject.create({ data: dto });
  }

  update(id: number, dto: UpdateSubjectDto) {
    return this.prisma.subject.update({ where: { id }, data: dto });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.subject.delete({ where: { id } });
  }
}
