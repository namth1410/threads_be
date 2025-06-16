import { Module } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadEntity } from './thread.entity';
import { UsersModule } from 'src/users/users.module';
import { MinioModule } from 'src/minio/minio.module';
import { MediaEntity } from 'src/minio/media.entity';
import { ThreadsRepository } from './threads.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ThreadEntity, MediaEntity]),
    UsersModule,
    MinioModule,
  ], // Đăng ký entity
  providers: [ThreadsService, ThreadsRepository],
  controllers: [ThreadsController],
})
export class ThreadsModule {}
