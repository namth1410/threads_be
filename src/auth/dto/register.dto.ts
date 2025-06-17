import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'testuser',
    description: 'Username for the new user',
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  username: string;

  @ApiProperty({
    example: 'testpassword',
    description: 'Password for the new user',
  })
  @IsNotEmpty()
  @Length(6, 20)
  password: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'Optional email address of the user',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
