// dto/forgot-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Email của người dùng để khôi phục mật khẩu',
  })
  @IsEmail()
  email: string;
}
