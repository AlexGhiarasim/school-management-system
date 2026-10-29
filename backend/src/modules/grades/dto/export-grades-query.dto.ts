import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import { CSV_LANGUAGES, type CsvLanguage } from '../grades-csv.util.js';

export class ExportGradesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  studentId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subjectId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  classId?: number;

  @ApiPropertyOptional({ enum: CSV_LANGUAGES, default: 'ro' })
  @IsOptional()
  @IsIn(CSV_LANGUAGES)
  language?: CsvLanguage;
}
