import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export class ListSubjectsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
