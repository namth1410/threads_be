import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'testuser', description: 'Username of the user' })
  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  username: string;

  @ApiProperty({ example: 'testpassword', description: 'Password of the user' })
  @IsNotEmpty()
  @Length(6, 20)
  password: string;
}
export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access token to be used for authentication',
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token to be used for obtaining a new access token',
  })
  refresh_token: string;
}
