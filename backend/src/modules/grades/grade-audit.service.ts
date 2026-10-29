import { Injectable } from '@nestjs/common';
import { toDateOnly } from '../../common/utils/date.util.js';
import {
  paginate,
  paginationArgs,
} from '../../common/utils/pagination.util.js';
import { PrismaService } from '../../database/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';
import type { ListGradeHistoryQueryDto } from './dto/list-grade-history-query.dto.js';

const profileName = { select: { firstName: true, lastName: true } };

const auditInclude = {
  actor: {
    select: {
      email: true,
      role: true,
      admin: profileName,
      teacher: profileName,
    },
  },
} satisfies Prisma.GradeAuditInclude;

type AuditWithActor = Prisma.GradeAuditGetPayload<{
  include: typeof auditInclude;
}>;

function toResponse({ actor, actorId: _actorId, ...entry }: AuditWithActor) {
  const profile = actor?.admin ?? actor?.teacher;

  return {
    ...entry,
    oldDate: entry.oldDate && toDateOnly(entry.oldDate),
    newDate: entry.newDate && toDateOnly(entry.newDate),
    actor: actor && {
      name: profile ? `${profile.firstName} ${profile.lastName}` : actor.email,
      role: actor.role,
    },
  };
}

@Injectable()
export class GradeAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListGradeHistoryQueryDto) {
    const where: Prisma.GradeAuditWhereInput = {
      ...(query.action && { action: query.action }),
    };

    const [entries, total] = await this.prisma.$transaction([
      this.prisma.gradeAudit.findMany({
        where,
        include: auditInclude,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        ...paginationArgs(query),
      }),
      this.prisma.gradeAudit.count({ where }),
    ]);

    return paginate(entries.map(toResponse), total, query);
  }

  async findForGrade(gradeId: number) {
    const entries = await this.prisma.gradeAudit.findMany({
      where: { gradeId },
      include: auditInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return entries.map(toResponse);
  }
}
