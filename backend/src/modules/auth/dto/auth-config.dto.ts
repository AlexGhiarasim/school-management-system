import { ApiProperty } from '@nestjs/swagger';

export class AuthConfigDto {
  @ApiProperty({
    description: 'Whether anyone can create a student account from the app',
  })
  registrationEnabled: boolean;
}
