import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './notification.entity';
import { NotificationGateway } from './notification.gateway';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { UsersModule } from 'src/users/users.module';
import { UserEntity } from 'src/users/user.entity';
import { NotificationsRepository } from './notifications.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, UserEntity]),
    UsersModule,
  ],
  providers: [
    NotificationsService,
    NotificationGateway,
    NotificationsRepository,
  ],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
