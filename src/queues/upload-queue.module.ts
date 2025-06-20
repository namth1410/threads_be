// src/queues/upload-queue.module.ts
import { Module } from '@nestjs/common';
import { UploadGateway } from 'src/gateways/upload.gateway';
import { UploadQueueProvider } from './bullmq.provider';
import { UploadQueueService } from './upload-queue.service';
import { UploadProcessor } from './upload.processor';

@Module({
  providers: [
    UploadQueueService,
    UploadProcessor,
    UploadQueueProvider,
    UploadGateway,
  ],
  exports: [UploadQueueService], // <-- CHỈ export cái cần dùng
})
export class UploadQueueModule {}
