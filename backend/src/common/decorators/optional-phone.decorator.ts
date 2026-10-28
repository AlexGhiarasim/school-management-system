import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import {
  PHONE_MAX_LENGTH,
  PHONE_PATTERN,
} from '../constants/validation.constants.js';

// A phone number is optional, in any international format. An empty value
// clears it.
export function OptionalPhone() {
  return applyDecorators(
    ApiPropertyOptional({ example: '+44 7700 900123', nullable: true }),
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string' ? value.trim() || null : value,
    ),
    IsOptional(),
    IsString(),
    MaxLength(PHONE_MAX_LENGTH),
    Matches(PHONE_PATTERN, { message: 'phone is not a valid phone number' }),
  );
}
