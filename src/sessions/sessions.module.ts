// sessions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])], // Đăng ký repository
  exports: [TypeOrmModule], // Xuất TypeOrmModule để có thể sử dụng ở module khác
})
export class SessionsModule {}
