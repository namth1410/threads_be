// threads.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  LoggerService,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UsersService } from 'src/users/users.service';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import guard
import { CreateThreadDto } from './dto/create-thread.dto';
import { ThreadResponseDto } from './dto/thread-response.dto';
import { ThreadsPaginationDto } from './dto/threads-pagination.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { ThreadEntity } from './thread.entity'; // Entity cho bài đăng
import { ThreadsService } from './threads.service';

@ApiTags('threads')
@Controller('threads')
@UseGuards(JwtAuthGuard) // Áp dụng guard cho toàn bộ controller
@ApiBearerAuth() // Áp dụng Bearer Auth cho toàn bộ controller
export class ThreadsController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService; // Inject logger Winston

  constructor(
    private readonly dataSource: DataSource,
    private readonly threadsService: ThreadsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all threads' })
  @ApiResponse({
    status: 200,
    description: 'List of threads.',
    type: [ThreadEntity],
  })
  @Roles(Role.SUPERADMIN, Role.USER)
  @UseGuards(RolesGuard)
  async findAll(
    @Query() paginationDto: ThreadsPaginationDto,
  ): Promise<PageResponseDto<ThreadResponseDto>> {
    const { data, meta } =
      await this.threadsService.getAllThreads(paginationDto);

    const threadResponseDtos = data.map(
      (thread) =>
        new ThreadResponseDto(
          thread.id,
          thread.content,
          thread.visibility,
          thread.media,
          thread.createdAt,
          thread.user,
          thread.updatedAt,
        ),
    );

    // Tạo PageResponseDto
    return new PageResponseDto<ThreadResponseDto>(
      threadResponseDtos,
      meta,
      'Threads retrieved successfully',
    );
  }

  // API để lấy threads của người dùng thực hiện request
  @Get('my-threads') // Bạn có thể điều chỉnh route theo ý muốn
  @ApiOperation({ summary: 'Retrieve threads for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of user threads.',
    type: [ThreadEntity],
  })
  async findUserThreads(
    @Request() req: any, // Lấy thông tin người dùng từ request
    @Query() paginationDto: PaginationDto, // Lấy thông tin phân trang từ query params
  ): Promise<PageResponseDto<ThreadResponseDto>> {
    const userId = req.user.id; // Lấy userId từ thông tin người dùng đã xác thực

    // Cập nhật bộ lọc để chỉ lấy các thread của người dùng hiện tại
    paginationDto.filters = {
      ...paginationDto.filters, // Giữ lại các bộ lọc hiện có
      user: { id: userId }, // Thay đổi ở đây để sử dụng object với thuộc tính user
    };

    const threadsWithPagination =
      await this.threadsService.getAllThreads(paginationDto);

    const threadResponseDtos = threadsWithPagination.data.map(
      (thread) =>
        new ThreadResponseDto(
          thread.id,
          thread.content,
          thread.visibility,
          thread.media,
          thread.createdAt,
          thread.user,
          thread.updatedAt,
        ),
    );

    // Tạo PageResponseDto
    return new PageResponseDto<ThreadResponseDto>(
      threadResponseDtos,
      threadsWithPagination.meta,
      'Threads retrieved successfully',
    );
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Create a new thread' })
  @ApiConsumes('multipart/form-data') // Chỉ định kiểu dữ liệu là multipart/form-data
  @ApiResponse({
    status: 201,
    description: 'Thread created successfully.',
    type: ThreadEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(
    @Body() createThreadDto: CreateThreadDto, // Use DTO here
    @Request() req: any, // Thêm request để lấy thông tin người dùng
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ResponseDto<ThreadResponseDto>> {
    const userId = req.user.id;
    // Fetch the user entity by ID
    const user = await this.usersService.getUserById(userId); // Adjust according to your service

    if (!user) {
      this.logger.error(`User with ID ${userId} not found`);
      throw new NotFoundException('User not found'); // Handle user not found scenario
    }

    try {
      const response = await this.dataSource.transaction(async (manager) => {
        // Tạo thread (pass manager vào để dùng trong transaction)
        const thread = await this.threadsService.create(
          {
            content: createThreadDto.content,
            user: user,
          },
          manager, // ⬅️ truyền manager vào
        );

        // Gắn media trực tiếp nếu có
        if (files && files.length > 0) {
          await this.threadsService.attachMedia(thread.id, files, manager);
        }

        // Build response object
        const threadResponse = new ThreadResponseDto(
          thread.id,
          thread.content,
          thread.visibility,
          thread.media,
          thread.createdAt,
          thread.user,
          thread.updatedAt,
        );

        return new ResponseDto(
          threadResponse,
          'Thread created successfully',
          201,
        );
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing thread' })
  @ApiResponse({
    status: 200,
    description: 'Thread updated successfully.',
    type: ThreadEntity,
  })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  async update(
    @Param('id') id: number,
    @Body() updateThreadDto: UpdateThreadDto, // Sử dụng DTO ở đây
  ): Promise<ResponseDto<ThreadResponseDto>> {
    // Chuyển đổi từ DTO sang Partial<ThreadEntity> trước khi gọi service
    const threadData: Partial<ThreadEntity> = {
      content: updateThreadDto.content,
    };
    const updatedThread = await this.threadsService.update(id, threadData);

    return new ResponseDto(updatedThread, 'Thread updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a thread' })
  @ApiResponse({ status: 204, description: 'Thread deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  @UseGuards(RolesGuard) // Chỉ cần kiểm tra vai trò
  @Roles(Role.SUPERADMIN, Role.USER) // Chỉ định các vai trò hợp lệ
  async remove(@Param('id') id: number, @Request() req): Promise<void> {
    const userId = req.user.id;
    return this.threadsService.remove(id, userId);
  }
}
