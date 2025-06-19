import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { diskStorage } from 'multer';
import * as path from 'path';
import { MediaEntity } from 'src/minio/media.entity';
import { MinioModule } from 'src/minio/minio.module';
import { UploadQueueModule } from 'src/queues/upload-queue.module';
import { UsersModule } from 'src/users/users.module';
import { ThreadEntity } from './thread.entity';
import { ThreadsController } from './threads.controller';
import { ThreadsRepository } from './threads.repository';
import { ThreadsService } from './threads.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ThreadEntity, MediaEntity]),
    UsersModule,
    MinioModule,
    UploadQueueModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads', // Thư mục lưu file tạm
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  ], // Đăng ký entity
  providers: [ThreadsService, ThreadsRepository],
  controllers: [ThreadsController],
})
export class ThreadsModule {}
