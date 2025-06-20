// src/processors/upload.processor.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';
import * as fs from 'fs';
import * as Minio from 'minio';
import { AppDataSource } from 'src/db/data-source';
import { UploadGateway } from 'src/gateways/upload.gateway';
import { MediaEntity } from 'src/minio/media.entity';

@Injectable()
export class UploadProcessor implements OnModuleInit {
  private minioClient: Minio.Client;

  constructor(private readonly uploadGateway: UploadGateway) {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
      port: Number(process.env.MINIO_PORT) || 9004,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || '',
      secretKey: process.env.MINIO_SECRET_KEY || '',
    });
  }

  onModuleInit() {
    new Worker(
      'upload-media',
      async (job) => {
        try {
          const { filePath, type, fileName, bucket, threadId } = job.data;

          if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at path: ${filePath}`);
          }

          const fileStream = fs.createReadStream(filePath);
          await this.minioClient.putObject(bucket, fileName, fileStream);

          const fileUrl = await this.minioClient.presignedGetObject(
            bucket,
            fileName,
            24 * 60 * 60,
          );

          if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
          }

          const mediaRepo = AppDataSource.getRepository(MediaEntity);

          await mediaRepo.update(
            { fileName, thread: { id: threadId } },
            { url: fileUrl },
          );

          fs.unlinkSync(filePath); // clean up

          // 🔔 Thông báo về client qua socket
          this.uploadGateway.notifyUploadComplete(threadId, fileUrl);
        } catch (err) {
          console.error('Upload job failed:', err);
          throw err; // Để BullMQ tự động retry nếu có cấu hình
        }
      },
      {
        connection: {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT) || 6379,
        },
      },
    );
  }
}
