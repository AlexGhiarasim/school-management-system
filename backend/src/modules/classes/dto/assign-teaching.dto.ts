import { IsInt } from 'class-validator';

export class AssignTeachingDto {
  @IsInt()
  teacherId: number;

  @IsInt()
  subjectId: number;
}
