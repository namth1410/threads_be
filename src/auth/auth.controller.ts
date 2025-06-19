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
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UserEntity } from 'src/users/user.entity';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' }) // Mô tả ngắn cho endpoint
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ResponseDto<UserEntity>> {
    const user = await this.authService.register(registerDto);
    return new ResponseDto(user, 'User registered successfully');
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
    const result = await this.authService.login(user);
    return new ResponseDto(result, 'User logged in successfully');
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
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ResponseDto<null>> {
    const userId = req.user.id;
    await this.authService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );

    return new ResponseDto(null, 'Password changed successfully');
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Gửi yêu cầu khôi phục mật khẩu qua email' })
  @ApiResponse({ status: 200, description: 'Email khôi phục đã được gửi' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ResponseDto<null>> {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return new ResponseDto(null, 'Email khôi phục đã được gửi');
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu mới bằng token' })
  @ApiResponse({ status: 200, description: 'Mật khẩu đã được cập nhật' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<ResponseDto<null>> {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );

    return new ResponseDto(null, 'Mật khẩu đã được cập nhật');
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({
    description: 'Access token refreshed',
    type: ResponseDto<LoginResponseDto>,
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ResponseDto<LoginResponseDto>> {
    const result = await this.authService.refreshAccessToken(
      refreshTokenDto.refresh_token,
    );
    return new ResponseDto(result, 'Token refreshed successfully');
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
