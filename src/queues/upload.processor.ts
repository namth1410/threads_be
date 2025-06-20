// src/processors/upload.processor.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';
import { UploadQueueService } from 'src/queues/upload-queue.service';

@Injectable()
export class UploadProcessor implements OnModuleInit {
  constructor(private readonly uploadQueueService: UploadQueueService) {}

  onModuleInit() {
    new Worker(
      'upload-media',
      async (job) => {
        await this.uploadQueueService.handle(job); // gọi service xử lý job
      },
      {
        connection: {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT) || 6379,
        },
      },
    );
    console.log('[UploadProcessor] Worker initialized');
  }
}
