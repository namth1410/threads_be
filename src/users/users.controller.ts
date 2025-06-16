import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard) // Áp dụng guard cho toàn bộ controller
@ApiBearerAuth() // Áp dụng Bearer Auth cho toàn bộ controller
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all users with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of users with pagination info',
    type: ResponseDto,
  })
  @Roles(Role.SUPERADMIN)
  @UseGuards(RolesGuard)
  async getAllUsers(
    @Query() paginationDto: PaginationDto,
  ): Promise<PageResponseDto<UserEntity>> {
    return this.usersService.getAllUsers(paginationDto);
  }

  // Phương thức cập nhật người dùng
  @Patch(':id')
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: ResponseDto,
  })
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  async updateUser(
    @Request() req: any, // Lấy thông tin từ request
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto<UserEntity>> {
    const userId = req.user.id; // Lấy ID từ thông tin xác thực
    return await this.usersService.updateUser(userId, updateUserDto);
  }
}
