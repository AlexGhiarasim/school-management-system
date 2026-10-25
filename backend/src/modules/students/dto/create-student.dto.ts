import {
  IsByteLength,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsBirthDate } from '../../../common/decorators/is-birth-date.decorator.js';
import {
  NormalizeEmail,
  Trim,
} from '../../../common/decorators/transform.decorators.js';
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_PATTERN,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
} from '../../../common/constants/validation.constants.js';

export class CreateStudentDto {
  @Trim()
  @IsString()
  @Length(NAME_MIN_LENGTH, NAME_MAX_LENGTH)
  @Matches(NAME_PATTERN, { message: 'firstName contains invalid characters' })
  firstName: string;

  @Trim()
  @IsString()
  @Length(NAME_MIN_LENGTH, NAME_MAX_LENGTH)
  @Matches(NAME_PATTERN, { message: 'lastName contains invalid characters' })
  lastName: string;

  @NormalizeEmail()
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @IsByteLength(1, PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_PATTERN, {
    message: 'password must contain at least one letter and one digit',
  })
  password: string;

  @IsBirthDate()
  dateOfBirth: string;

  @IsOptional()
  @IsInt()
  classId?: number;
}
