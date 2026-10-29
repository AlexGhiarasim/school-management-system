import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { StatisticsQueryDto } from './dto/statistics-query.dto.js';
import { buildStatistics } from './statistics.util.js';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview({ classId }: StatisticsQueryDto) {
    if (classId !== undefined) {
      const count = await this.prisma.class.count({ where: { id: classId } });

      if (count === 0) {
        throw new NotFoundException(`Class ${classId} not found`);
      }
    }

    const inClass = classId === undefined ? {} : { classId };

    const [students, grades] = await Promise.all([
      this.prisma.student.findMany({
        where: inClass,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          class: { select: { id: true, name: true } },
        },
      }),
      this.prisma.grade.findMany({
        where: { student: inClass },
        select: {
          value: true,
          date: true,
          studentId: true,
          subject: { select: { id: true, name: true } },
        },
      }),
    ]);

    return buildStatistics(students, grades);
  }
}
