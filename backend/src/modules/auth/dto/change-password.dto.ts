import { ApiProperty } from '@nestjs/swagger';
import { IsByteLength, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PASSWORD_MAX_LENGTH } from '../../../common/constants/validation.constants.js';
import { StrongPassword } from '../../../common/decorators/strong-password.decorator.js';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  @IsByteLength(1, PASSWORD_MAX_LENGTH)
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword123' })
  @StrongPassword()
  newPassword: string;
}
