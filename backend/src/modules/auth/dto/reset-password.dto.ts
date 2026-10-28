import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { StrongPassword } from '../../../common/decorators/strong-password.decorator.js';

export class ResetPasswordDto {
  @ApiProperty({ description: 'The token from the email link' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  token: string;

  @ApiProperty({ example: 'NewPassword123' })
  @StrongPassword()
  password: string;
}
