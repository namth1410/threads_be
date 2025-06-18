// src/auth/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'password',
    description: 'Mật khẩu hiện tại',
  })
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    example: 'password1',
    description: 'Mật khẩu mới',
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
