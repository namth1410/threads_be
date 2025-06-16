import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class ThreadsPaginationDto extends PaginationDto {
  @ApiProperty({ required: false, description: 'Content to filter threads' })
  @IsOptional()
  @IsString()
  content?: string; // Bộ lọc cho nội dung
}
