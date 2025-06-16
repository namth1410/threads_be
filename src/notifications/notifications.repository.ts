import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { NotificationEntity } from './notification.entity';

@Injectable()
export class NotificationsRepository extends BaseRepository<NotificationEntity> {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationEntityRepository: Repository<NotificationEntity>,
  ) {
    super(notificationEntityRepository);
  }
}
