import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateGradeDto } from './create-grade.dto.js';

export class UpdateGradeDto extends PartialType(
  OmitType(CreateGradeDto, ['studentId'] as const),
) {}
