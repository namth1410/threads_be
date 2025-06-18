import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ResponseDto } from 'src/common/dto/response.dto';
import { SessionsService } from 'src/sessions/sessions.service';
import { UserEntity } from 'src/users/user.entity';
import { UsersRepository } from 'src/users/users.repository';
import { SessionEntity } from '../sessions/session.entity';
import { UsersService } from '../users/users.service'; // Service quản lý người dùng
import { LoginResponseDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailService } from './mail.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly sessionsService: SessionsService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    return this.usersService.createUser({
      username: registerDto.username,
      password: hashedPassword,
      displayId: registerDto.username,
    });
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.getHashPasswordByUsername(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateRefreshToken(
    refreshToken: string,
  ): Promise<SessionEntity | null> {
    const session = await this.sessionsService.getByCriteria({
      where: { refreshToken },
    });
    if (!session) {
      return null;
    }

    try {
      // Kiểm tra refreshToken còn hợp lệ không
      this.jwtService.verify(refreshToken);
      return session;
    } catch (e) {
      return null;
    }
  }

  async login(user: UserEntity): Promise<ResponseDto<LoginResponseDto>> {
    const { accessToken, refreshToken } = this.generateToken(user);

    // Xoá session cũ nếu có
    await this.sessionsService.deleteSession({ userId: user.id });

    // Tạo session mới
    await this.sessionsService.createSession({
      userId: user.id,
      token: accessToken,
      refreshToken,
    });

    return new ResponseDto(
      {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      'Login successful',
    );
  }

  async setNewPassword(userId: number, newPassword: string): Promise<void> {
    const hashed = await this.hashPassword(newPassword);
    await this.userRepository.updateEntity(userId, { password: hashed });
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<ResponseDto<string>> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // Bắt buộc select password
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new BadRequestException('User not found'); // Cũng có thể là NotFoundException
    }

    const isMatch = await this.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    await this.setNewPassword(userId, newPassword);

    return new ResponseDto(null, 'Password changed successfully');
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOneByOptions({
      where: { email },
    });
    if (!user) throw new NotFoundException('Email không tồn tại');

    const token = this.jwtService.sign(
      { email: user.email },
      { expiresIn: '15m' }, // Token hết hạn sau 15 phút
    );

    await this.mailService.sendResetPasswordEmail(user.email, token);

    return new ResponseDto(null, 'Đã gửi email khôi phục mật khẩu');
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOneByOptions({
        where: { email: payload.email },
      });
      if (!user) throw new NotFoundException('Người dùng không tồn tại');

      await this.setNewPassword(user.id, newPassword);

      return new ResponseDto(null, 'Đặt lại mật khẩu thành công');
    } catch (err) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  async logout(userId: number) {
    await this.userRepository.incrementEntity(
      { id: userId },
      'tokenVersion',
      1,
    );
  }

  async validateSession(token: string): Promise<any> {
    const session = await this.sessionsService.getByCriteria({
      where: { token },
    });
    return session ? session.userId : null;
  }

  generateToken(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      tokenVersion: user.tokenVersion,
    };

    // Tạo accessToken với thời hạn ngắn hơn
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '24h', // accessToken có thời hạn 1 giờ
    });

    // Tạo refreshToken với thời hạn dài hơn
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // refreshToken có thời hạn 7 ngày
    });

    return { accessToken, refreshToken };
  }
}
