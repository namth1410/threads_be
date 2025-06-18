// src/queues/upload-queue.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class UploadQueueService {
  constructor(@Inject('UPLOAD_QUEUE') private readonly uploadQueue: Queue) {}

  async addUploadJob(data: { filePath: string; type: 'image' | 'video' }) {
    await this.uploadQueue.add('upload', data);
  }
}
