import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { NotificationStatus } from '../enums/notification-status.enum';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'The title of the notification',
    example: 'System Update',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The message content of the notification',
    example: 'The system will be updated at midnight.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: ['IMMEDIATE', 'SCHEDULED'],
    example: 'IMMEDIATE',
  })
  @IsEnum(['IMMEDIATE', 'SCHEDULED'])
  type: 'IMMEDIATE' | 'SCHEDULED';

  @ApiProperty({
    description:
      'The scheduled date and time for the notification (if type is SCHEDULED)',
    example: '2024-12-31T23:59:00Z',
    required: false,
  })
  @IsOptional()
  @ValidateIf((dto) => dto.type === 'SCHEDULED') // Chỉ áp dụng nếu type là 'SCHEDULED'
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : value))
  scheduleAt?: Date;

  @ApiProperty({
    description: 'The status of the notification',
    enum: NotificationStatus,
    example: NotificationStatus.SENT,
    required: false,
  })
  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @ApiProperty({
    description: 'ID of the user who sends the notification',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  senderId: number;

  @ApiProperty({
    description: 'Id of user',
    example: 1,
    required: false,
  })
  @IsArray()
  @IsOptional()
  recipientId?: number;

  @ApiProperty({
    description: 'Flag to indicate if the notification is sent to all users',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  sendToAll: boolean;
}
