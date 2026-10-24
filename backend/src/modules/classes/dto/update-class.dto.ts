import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateClassDto } from './create-class.dto.js';

export class UpdateClassDto extends PartialType(
  OmitType(CreateClassDto, ['teacherId'] as const),
) {}
