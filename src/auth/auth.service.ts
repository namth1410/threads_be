// auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UserEntity } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { SessionEntity } from '../sessions/session.entity';
import { UsersService } from '../users/users.service'; // Service quản lý người dùng
import { LoginResponseDto } from './dto/login.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersService.createUser({
      username,
      password: hashedPassword,
      displayId: username,
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
    const session = await this.sessionRepository.findOne({
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
    await this.sessionRepository.delete({ userId: user.id });

    // Tạo session mới
    const session = this.sessionRepository.create({
      userId: user.id,
      token: accessToken,
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 3600 * 1000 * 24), // 1 giờ
    });

    await this.sessionRepository.save(session);

    return new ResponseDto(
      {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      'Login successful',
    );
  }

  async logout(userId: number) {
    await this.userRepository.update(userId, {
      tokenVersion: () => 'tokenVersion + 1', // Tăng tokenVersion lên 1
    });
  }

  async validateSession(token: string): Promise<any> {
    const session = await this.sessionRepository.findOne({ where: { token } });
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
      expiresIn: '1h', // accessToken có thời hạn 1 giờ
    });

    // Tạo refreshToken với thời hạn dài hơn
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // refreshToken có thời hạn 7 ngày
    });

    return { accessToken, refreshToken };
  }
}
