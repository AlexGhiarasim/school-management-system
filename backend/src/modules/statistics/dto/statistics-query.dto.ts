import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class StatisticsQueryDto {
  @ApiPropertyOptional({ description: 'Limit the statistics to one class' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  classId?: number;
}
