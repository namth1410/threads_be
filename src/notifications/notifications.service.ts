import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UserEntity } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateNotificationsDto } from './dto/create-notifications.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationStatus } from './enums/notification-status.enum';
import { NotificationEntity } from './notification.entity';
import { NotificationGateway } from './notification.gateway';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationGateway: NotificationGateway,
    @InjectRepository(UserEntity)
    private readonly userService: UsersService,
  ) {}

  async createNotifications(
    createNotificationsDto: CreateNotificationsDto,
  ): Promise<null> {
    const { recipientIds, sendToAll, senderId, ...notificationData } =
      createNotificationsDto;

    let recipients: number[];

    // Xử lý danh sách recipientIds
    if (sendToAll) {
      // Lấy danh sách tất cả người dùng (Giả sử userService có phương thức này)
      recipients = await this.userService.getAllUserIds(); // Thay `getAllUserIds` bằng phương thức thực tế
    } else {
      if (!recipientIds || recipientIds.length === 0) {
        throw new BadRequestException(
          'recipientIds is required when sendToAll is false',
        );
      }
      recipients = recipientIds;
    }

    // Tạo danh sách thông báo
    await Promise.all(
      recipients.map(async (recipientId) => {
        const notification = await this.createNotification({
          ...notificationData,
          senderId,
          recipientId,
          sendToAll,
          status: NotificationStatus.SENT,
        });

        console.log(`notification`);
        console.log(notification);

        // Gửi thông báo qua WebSocket tới từng người dùng
        this.notificationGateway.sendNotificationToUser(
          recipientId,
          notification.data.title,
        );

        return notification;
      }),
    );

    // Trả về danh sách thông báo đã tạo
    return null;
  }

  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<ResponseDto<NotificationEntity>> {
    return this.notificationsRepository.createEntity(createNotificationDto);
  }

  async getAllNotifications(
    paginationDto: PaginationDto,
  ): Promise<PageResponseDto<NotificationEntity>> {
    // Gọi phương thức getAllEntity từ notificationsRepository và truyền vào paginationDto
    return this.notificationsRepository.getAllEntity({
      skip: (paginationDto.page - 1) * paginationDto.limit,
      take: paginationDto.limit,
      order: paginationDto.sortBy
        ? { [paginationDto.sortBy]: paginationDto.order }
        : undefined,
      where: paginationDto.filters,
    });
  }

  async updateNotification(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<ResponseDto<NotificationEntity>> {
    const notification = await this.notificationsRepository.getEntityByCriteria(
      {
        id: id,
      },
    );

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return this.notificationsRepository.updateEntity(id, updateNotificationDto);
  }

  async markAllAsRead(userId: number): Promise<void> {
    // Tìm tất cả các thông báo chưa đọc (status = UNREAD) của người dùng
    const unreadNotifications = await this.notificationsRepository.find({
      where: { recipientId: userId },
    });

    if (unreadNotifications.length === 0) {
      throw new Error('No unread notifications found for this user');
    }

    // Cập nhật trạng thái thành READ cho tất cả các thông báo chưa đọc
    const updatePromises = unreadNotifications.map((notification) =>
      this.notificationsRepository.updateEntity(notification.id, {
        status: NotificationStatus.READ,
      }),
    );

    // Chờ tất cả các cập nhật hoàn thành
    await Promise.all(updatePromises);
  }

  async deleteNotification(id: number): Promise<void> {
    await this.notificationsRepository.deleteEntity(id);
  }
}
