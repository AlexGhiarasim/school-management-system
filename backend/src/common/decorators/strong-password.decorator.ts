import { applyDecorators } from '@nestjs/common';
import {
  IsByteLength,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
} from '../constants/validation.constants.js';

// Length and character rules shared by every password a user can choose.
export function StrongPassword() {
  return applyDecorators(
    IsString(),
    MinLength(PASSWORD_MIN_LENGTH),
    MaxLength(PASSWORD_MAX_LENGTH),
    IsByteLength(1, PASSWORD_MAX_LENGTH),
    Matches(PASSWORD_PATTERN, {
      message: 'password must contain at least one letter and one digit',
    }),
  );
}
