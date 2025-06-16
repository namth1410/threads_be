import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity'; // Đảm bảo rằng bạn đã nhập đúng
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]), // Nếu bạn đang sử dụng TypeORM
  ],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, TypeOrmModule, UsersRepository],
  controllers: [UsersController],
})
export class UsersModule {}
