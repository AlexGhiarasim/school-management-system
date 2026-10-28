import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, MaxLength } from 'class-validator';
import { EMAIL_MAX_LENGTH } from '../../../common/constants/validation.constants.js';
import { NormalizeEmail } from '../../../common/decorators/transform.decorators.js';

export const EMAIL_LANGUAGES = ['ro', 'en'] as const;
export type EmailLanguage = (typeof EMAIL_LANGUAGES)[number];

export class ForgotPasswordDto {
  @ApiProperty({ example: 'laura.marin@school.test' })
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;

  @ApiPropertyOptional({ enum: EMAIL_LANGUAGES, default: 'ro' })
  @IsOptional()
  @IsIn(EMAIL_LANGUAGES)
  language?: EmailLanguage;
}
