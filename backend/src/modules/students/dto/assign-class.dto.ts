import { IsInt, ValidateIf } from 'class-validator';

export class AssignClassDto {
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  classId: number | null;
}
