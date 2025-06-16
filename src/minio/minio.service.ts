import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT, 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
  }

  async uploadFile(bucketName: string, file: Express.Multer.File) {
    // Thay đổi kiểu cho 'file'
    const fileName = `${Date.now()}-${file.originalname}`;
    try {
      await this.minioClient.putObject(bucketName, fileName, file.buffer);
      return fileName;
    } catch (error) {
      // Ghi log chi tiết lỗi
      console.log(
        `Failed to upload file to bucket "${bucketName}". File name: "${fileName}". Error: ${error.message}`,
        error.stack,
      );

      // Throw lại lỗi để xử lý tiếp tục ở tầng khác nếu cần
      throw new Error(`Upload failed for file "${fileName}": ${error.message}`);
    }
  }

  async getFileUrl(bucketName: string, fileName: string) {
    return await this.minioClient.presignedUrl(
      'GET',
      bucketName,
      fileName,
      3600,
    );
  }

  async removeFile(bucketName: string, fileName: string): Promise<void> {
    return await this.minioClient.removeObject(bucketName, fileName);
  }
}
