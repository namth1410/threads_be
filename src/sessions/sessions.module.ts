// sessions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './session.entity';
import { SessionsService } from './sessions.service';
import { SessionsRepository } from './sessions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])], // Đăng ký repository
  exports: [SessionsService, SessionsRepository],
  providers: [SessionsService, SessionsRepository], // Xuất TypeOrmModule để có thể sử dụng ở module khác
})
export class SessionsModule {}
