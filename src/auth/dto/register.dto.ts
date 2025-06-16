import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

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
}
