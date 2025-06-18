// dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'JWT_TOKEN_TU_EMAIL',
    description: 'Token đặt lại mật khẩu được gửi qua email',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'newStrongPassword123',
    description: 'Mật khẩu mới',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}