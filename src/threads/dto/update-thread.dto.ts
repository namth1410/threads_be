import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateThreadDto {
  @ApiProperty({
    example: 'This is the updated thread content',
    description: 'Updated content of the thread',
  })
  @IsOptional() // Trường này có thể không có (optional)
  @IsString()
  @Length(1, 500) // Giới hạn chiều dài của nội dung bài đăng
  content?: string; // Thay đổi để cho phép cập nhật nội dung

  // Bạn có thể thêm các trường khác nếu cần
}
