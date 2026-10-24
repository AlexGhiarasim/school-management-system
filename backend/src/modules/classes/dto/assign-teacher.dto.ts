import { IsInt, ValidateIf } from 'class-validator';

export class AssignTeacherDto {
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  teacherId: number | null;
}
