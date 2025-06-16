import { IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Email must be a valid email address',
    required: false,
    default: 'example@example.com', // Giá trị mặc định cho email
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Display ID for the user',
    required: false,
    default: 'user-display-id-123', // Giá trị mặc định cho displayId
  })
  @IsOptional()
  displayId?: string;
}
