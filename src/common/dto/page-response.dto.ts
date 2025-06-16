import { PaginationMetaDto } from './pagination-meta.dto';

export class PageResponseDto<T> {
  data: T[];
  pagination: PaginationMetaDto;
  message: string;
  statusCode: number;
  success: boolean;

  constructor(
    data: T[],
    pagination: PaginationMetaDto,
    message: string,
    statusCode: number = 200,
    success: boolean = true,
  ) {
    this.data = data;
    this.pagination = pagination;
    this.message = message;
    this.statusCode = statusCode;
    this.success = success;
  }
}
