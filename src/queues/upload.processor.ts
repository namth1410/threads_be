import { Worker } from 'bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadProcessor implements OnModuleInit {
  private minioClient: Minio.Client;

  constructor() {
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
        const { filePath, type } = job.data;
        const fileStream = fs.createReadStream(filePath);
        const fileName = path.basename(filePath);

        await this.minioClient.putObject(
          process.env.MINIO_BUCKET_NAME || 'threads',
          fileName,
          fileStream,
        );

        console.log(`Uploaded ${type}: ${fileName}`);
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
