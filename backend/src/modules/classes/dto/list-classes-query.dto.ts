import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export class ListClassesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
