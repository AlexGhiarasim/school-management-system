import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { IMPORT_LANGUAGES, type ImportLanguage } from '../import.types.js';

export class ImportTemplateQueryDto {
  @ApiPropertyOptional({ enum: IMPORT_LANGUAGES, default: 'ro' })
  @IsOptional()
  @IsIn(IMPORT_LANGUAGES)
  language?: ImportLanguage;
}
