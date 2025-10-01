import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { memoryStorage } from 'multer';
import { MediaEntity } from 'src/minio/media.entity';
import { MinioModule } from 'src/minio/minio.module';
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
    MulterModule.register({ storage: memoryStorage() }),
  ], // Đăng ký entity
  providers: [ThreadsService, ThreadsRepository],
  controllers: [ThreadsController],
})
export class ThreadsModule {}
