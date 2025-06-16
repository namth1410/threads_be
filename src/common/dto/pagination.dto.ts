import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ default: 1, required: false, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1; // Không dùng `?`, vì giá trị mặc định sẽ được set.

  @ApiProperty({
    default: 10,
    required: false,
    description: 'Number of items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10; // Tương tự, không dùng `?` để đảm bảo luôn có giá trị.

  @ApiProperty({ required: false, description: 'Field to sort by' })
  @IsOptional()
  @IsString()
  sortBy?: string; // Các trường tùy chọn có thể giữ nguyên `?`.

  @ApiProperty({
    enum: ['ASC', 'DESC'],
    default: 'ASC',
    required: false,
    description: 'Sort order',
  })
  @IsOptional()
  @IsString()
  order: 'ASC' | 'DESC' = 'ASC'; // Giá trị mặc định là 'ASC'.

  @ApiProperty({ required: false, description: 'Filters to apply' })
  @IsOptional()
  filters?: Record<string, any>; // Bộ lọc không bắt buộc.
}
