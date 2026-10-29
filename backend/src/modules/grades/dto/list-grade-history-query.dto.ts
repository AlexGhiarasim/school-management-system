import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { GradeAuditAction } from '../../../generated/prisma/enums.js';

export class ListGradeHistoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: GradeAuditAction })
  @IsOptional()
  @IsEnum(GradeAuditAction)
  action?: GradeAuditAction;
}
