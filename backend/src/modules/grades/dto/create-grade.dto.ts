import { IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator';

export class CreateGradeDto {
  @IsInt()
  studentId: number;

  @IsInt()
  subjectId: number;

  @IsInt()
  @Min(1)
  @Max(10)
  value: number;

  @IsOptional()
  @IsISO8601({ strict: true })
  date?: string;
}
