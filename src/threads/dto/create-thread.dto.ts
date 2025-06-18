import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateThreadDto {
  @ApiProperty({
    example: 'This is a sample thread content',
    description: 'Content of the thread',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 500)
  content: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Multiple files (optional)',
    required: false,
  })
  files?: any; // Không cần validate vì Nest không parse file vào DTO
}
