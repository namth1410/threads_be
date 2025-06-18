// src/queues/upload-queue.module.ts
import { Module } from '@nestjs/common';
import { UploadQueueProvider } from './bullmq.provider';
import { UploadQueueService } from './upload-queue.service';
import { UploadProcessor } from './upload.processor';

@Module({
  providers: [UploadQueueService, UploadProcessor, UploadQueueProvider],
  exports: [UploadQueueService], // <-- CHỈ export cái cần dùng
})
export class UploadQueueModule {}
