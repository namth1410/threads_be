import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseDto } from '../common/dto/response.dto';
import { MinioService } from './minio.service';
export class PresignedUrlDto {
  @ApiProperty({ example: 'https://localhost:9000/threads/abc.png?...' })
  url: string;
}

@ApiTags('MinIO')
@Controller('minio')
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Get('presigned')
  @ApiOperation({ summary: 'Get presigned URL to access a file' })
  @ApiQuery({
    name: 'fileName',
    required: true,
    description: 'Tên file cần lấy URL',
  })
  @ApiOkResponse({
    description: 'Presigned URL generated',
    type: ResponseDto, // Swagger sẽ không tự infer T, cần override bên dưới
    schema: {
      example: {
        data: {
          url: 'http://localhost:9000/threads/example.png?X-Amz-Signature=...',
        },
        message: 'URL created successfully',
        statusCode: 200,
      },
    },
  })
  async getPresignedUrl(
    @Query('fileName') fileName: string,
  ): Promise<ResponseDto<PresignedUrlDto>> {
    const url = await this.minioService.getFileUrl('threads', fileName);
    return new ResponseDto<PresignedUrlDto>(
      { url },
      'URL created successfully',
    );
  }
}
