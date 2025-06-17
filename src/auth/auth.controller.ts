// auth.controller.ts
import {
  Body,
  Controller,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UserEntity } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectRepository(UserEntity) // Inject UserRepository thay vì sử dụng UsersService
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' }) // Mô tả ngắn cho endpoint
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ResponseDto<UserEntity>> {
    return this.authService.register(
      registerDto.username,
      registerDto.password,
    );
  }

  @ApiExtraModels(ResponseDto, LoginResponseDto) // 👈 Đăng ký model
  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiOkResponse({
    description: 'User logged in successfully.',
    type: ResponseDto<LoginResponseDto>, // Định nghĩa kiểu trả về
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ResponseDto<LoginResponseDto>> {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or invalid password.',
  })
  @ApiBody({
    description: 'Current and new password',
    type: ChangePasswordDto,
    examples: {
      default: {
        summary: 'Change password example',
        value: {
          currentPassword: 'password',
          newPassword: 'password1',
        },
      },
    },
  })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ResponseDto<string>> {
    const userId = req.user.id;
    console.log(userId);

    return this.authService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Gửi yêu cầu khôi phục mật khẩu qua email' })
  @ApiResponse({ status: 200, description: 'Email khôi phục đã được gửi' })
  @ApiBody({
    type: ForgotPasswordDto,
    examples: {
      default: {
        summary: 'Ví dụ quên mật khẩu',
        value: {
          email: 'example@gmail.com',
        },
      },
    },
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ResponseDto<string>> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu mới bằng token' })
  @ApiResponse({ status: 200, description: 'Mật khẩu đã được cập nhật' })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      default: {
        summary: 'Ví dụ đặt lại mật khẩu',
        value: {
          token: 'JWT_TOKEN_TU_EMAIL',
          newPassword: 'newStrongPassword123',
        },
      },
    },
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<ResponseDto<string>> {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refresh_token } = refreshTokenDto;
    const session = await this.authService.validateRefreshToken(refresh_token);
    if (!session) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findOne({
      where: { id: session.userId },
    });

    return this.authService.login(user); // Tạo accessToken mới
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard) // Bảo vệ route logout bằng JWT guard
  @ApiBearerAuth() // Thêm Bearer Auth vào route
  @ApiOperation({ summary: 'Log out a user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully.' })
  async logout(@Request() req) {
    // Thường bạn sẽ lấy userId từ token
    const userId = req.user.id; // giả sử req.user được xác thực trước đó
    return this.authService.logout(userId);
  }
}
