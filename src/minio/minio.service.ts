import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import * as path from 'path';
import { removeVietnameseTones } from 'src/common/helpers/normalize.helper';

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
    const originalName = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );

    const ext = path.extname(originalName); // ".jpeg"

    const baseName = path.basename(originalName, ext); // "ảnh đẹp"

    // Loại bỏ dấu và ký tự đặc biệt để tránh lỗi với Unicode
    const safeBaseName = removeVietnameseTones(baseName);

    const fileName = `${Date.now()}-${safeBaseName}${ext}`;
    try {
      await this.minioClient.putObject(bucketName, fileName, file.buffer);
      return fileName;
    } catch (error) {
      console.log(
        `Failed to upload file to bucket "${bucketName}". File name: "${fileName}". Error: ${error.message}`,
        error.stack,
      );
      throw new Error(`Upload failed for file "${fileName}": ${error.message}`);
    }
  }

  getPublicUrl(bucketName: string, fileName: string): string {
    const baseUrl =
      process.env.MINIO_PUBLIC_BASE_URL || 'http://127.0.0.1:9004';
    return `${baseUrl}/${bucketName}/${fileName}`;
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
