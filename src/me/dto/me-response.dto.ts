import { ApiProperty } from '@nestjs/swagger';

export class MeResponseDto {
  @ApiProperty({ example: 1, description: 'ID của người dùng' })
  id: number;

  @ApiProperty({ example: 'username', description: 'Tên người dùng' })
  username: string;

  @ApiProperty({
    example: 'dangnam141002@gmail.com',
    description: 'Địa chỉ email',
  })
  email: string;

  @ApiProperty({
    example: 'username',
    description: 'Mã hiển thị công khai của người dùng',
  })
  displayId: string;

  @ApiProperty({
    example: 'user',
    description: 'Vai trò của người dùng (user/admin)',
  })
  role: string;

  @ApiProperty({
    example: '2025-06-19T12:34:56.789Z',
    description: 'Thời điểm tạo tài khoản',
  })
  createdAt: Date;
}
