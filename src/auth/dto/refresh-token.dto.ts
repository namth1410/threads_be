import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'some-refresh-token',
    description: 'Refresh token for renewing access token',
  })
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
