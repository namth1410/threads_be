import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateNotificationsDto } from './dto/create-notifications.dto';
import { NotificationEntity } from './notification.entity';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully.',
    type: NotificationEntity,
  })
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(RolesGuard)
  async create(
    @Body() createNotificationsDto: CreateNotificationsDto,
  ): Promise<NotificationEntity[]> {
    return this.notificationService.createNotifications(createNotificationsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all notifications' })
  @ApiResponse({
    status: 200,
    description: 'List of notifications.',
    type: PageResponseDto,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by notification status (optional)',
  })
  async getAllNotifications(
    @Query() paginationDto: PaginationDto, // Thông tin phân trang
    @Query('status') status?: string, // Lọc theo trạng thái thông báo
  ): Promise<PageResponseDto<NotificationEntity>> {
    const notificationsWithPagination =
      await this.notificationService.getAllNotifications({
        ...paginationDto,
        filters: status ? { status } : undefined, // Chỉ thêm filter nếu có trạng thái
      });

    return notificationsWithPagination;
  }

  @Get('read-all/:userId')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as READ.',
    type: null,
  })
  async readAllNotifications(
    @Param('userId') userId: number, // Lấy userId từ tham số
  ): Promise<null> {
    await this.notificationService.markAllAsRead(userId);
    return null;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: 204,
    description: 'Notification deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(RolesGuard)
  async deleteNotification(@Param('id') id: number): Promise<void> {
    return this.notificationService.deleteNotification(id);
  }
}
