import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty()
  data: T;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  statusCode?: number;

  constructor(data: T, message?: string, statusCode: number = 200) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
  }
}
