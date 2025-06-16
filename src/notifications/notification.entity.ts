import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationStatus } from './enums/notification-status.enum';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'Unique identifier for the notification',
    example: 1,
  })
  id: number;

  @Column()
  @ApiProperty({
    description: 'Title of the notification',
    example: 'System Maintenance Update',
  })
  title: string;

  @Column()
  @ApiProperty({
    description: 'Message content of the notification',
    example: 'The system will undergo maintenance at 2:00 AM UTC.',
  })
  message: string;

  @Column({
    type: 'enum',
    enum: ['IMMEDIATE', 'SCHEDULED'],
    default: 'IMMEDIATE',
  })
  @ApiProperty({
    description: 'Type of notification',
    example: 'IMMEDIATE',
    enum: ['IMMEDIATE', 'SCHEDULED'],
  })
  type: 'IMMEDIATE' | 'SCHEDULED';

  @Column({ nullable: true })
  @ApiProperty({
    description:
      'Scheduled time for the notification (if type is SCHEDULED). Null if immediate.',
    example: '2024-12-31T23:59:59Z',
    nullable: true,
  })
  scheduleAt: Date;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.SENT,
  })
  @ApiProperty({
    description: 'Current status of the notification',
    example: NotificationStatus.SENT,
    enum: NotificationStatus,
  })
  status: NotificationStatus;

  @CreateDateColumn()
  @ApiProperty({
    description: 'Timestamp when the notification was created',
    example: '2024-12-01T14:30:00Z',
  })
  createdAt: Date;

  // Thêm trường senderId để lưu người gửi thông báo
  @Column()
  @ApiProperty({
    description: 'ID of the user who sends the notification',
    example: 1,
  })
  senderId: number;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'ID of the recipient for the notification',
    example: 2,
    nullable: true,
  })
  recipientId: number;

  // Thêm trường sendToAll để đánh dấu thông báo gửi cho tất cả người dùng
  @Column({ default: false })
  @ApiProperty({
    description: 'Flag to indicate if the notification is sent to all users',
    example: true,
  })
  sendToAll: boolean;
}
