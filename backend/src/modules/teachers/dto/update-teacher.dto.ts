import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto.js';

export class UpdateTeacherDto extends PartialType(
  OmitType(CreateTeacherDto, ['password'] as const),
) {}
