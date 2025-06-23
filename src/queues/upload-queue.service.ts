// src/queues/upload-queue.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as Minio from 'minio';
import { AppDataSource } from 'src/db/data-source';
import { UploadGateway } from 'src/gateways/upload.gateway';
import { MediaEntity } from 'src/minio/media.entity';

const ffmpegPath = require('ffmpeg-static') as string;
ffmpeg.setFfmpegPath(ffmpegPath);

@Injectable()
export class UploadQueueService {
  private readonly minioClient: Minio.Client;

  constructor(
    @Inject('UPLOAD_QUEUE') private readonly uploadQueue: Queue,
    private readonly uploadGateway: UploadGateway,
  ) {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
      port: Number(process.env.MINIO_PORT) || 9004,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || '',
      secretKey: process.env.MINIO_SECRET_KEY || '',
    });
  }

  async addUploadJob(data: {
    filePath: string;
    type: string;
    fileName: string;
    bucket: string;
    threadId: number;
  }) {
    await this.uploadQueue.add('upload', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
    });
  }

  async handle(job: Job) {
    const { filePath, fileName, bucket, threadId } = job.data;
    console.log('ffmpegPath:', ffmpegPath);

    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      let finalPath = filePath;

      // ✅ Nếu là video mp4 → encode lại để đảm bảo "fast start"
      if (fileName.endsWith('.mp4')) {
        const encodedPath = filePath.replace(/\.mp4$/, '_encoded.mp4');

        await new Promise<void>((resolve, reject) => {
          ffmpeg(filePath)
            .outputOptions('-movflags', 'faststart')
            .output(encodedPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
        });

        finalPath = encodedPath;
      }

      const fileStream = fs.createReadStream(finalPath);
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

      fs.unlinkSync(filePath); // Clean up local file
      if (finalPath !== filePath && fs.existsSync(finalPath)) {
        fs.unlinkSync(finalPath); // bản encode
      }

      this.uploadGateway.notifyUploadComplete(threadId, fileUrl);
    } catch (err) {
      console.error(
        `[UploadQueueService] Upload job failed for ${fileName}:`,
        err,
      );
      // ⚠️ Xoá bản ghi nếu upload thất bại
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const mediaRepo = AppDataSource.getRepository(MediaEntity);
      await mediaRepo.delete({ fileName, thread: { id: threadId } });

      this.uploadGateway.notifyUploadFailed(threadId, err.message);
      throw err; // Quan trọng: để BullMQ biết job fail và retry
    }
  }
}
