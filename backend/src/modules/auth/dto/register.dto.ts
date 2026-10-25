import { OmitType } from '@nestjs/swagger';
import { CreateStudentDto } from '../../students/dto/create-student.dto.js';

export class RegisterDto extends OmitType(CreateStudentDto, [
  'classId',
] as const) {}
