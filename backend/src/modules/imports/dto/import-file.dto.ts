import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

// Below the 100 kb that the server accepts in a request. 200 rows are about 20 kb.
export const MAX_IMPORT_CHARACTERS = 90_000;

export class ImportFileDto {
  @ApiProperty({ description: 'The text of the CSV file' })
  @IsString()
  @MaxLength(MAX_IMPORT_CHARACTERS)
  content: string;
}
