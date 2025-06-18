import { Queue } from 'bullmq';

export const UploadQueueProvider = {
  provide: 'UPLOAD_QUEUE',
  useFactory: () => {
    return new Queue('upload-media', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    });
  },
};
