// src/me/me.controller.ts

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserEntity } from 'src/users/user.entity';
import { MeService } from './me.service';
import { ResponseDto } from 'src/common/dto/response.dto';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @UseGuards(JwtAuthGuard) // Bảo vệ API với guard JWT
  @Get()
  async getMe(@Req() request: Request) {
    const user = request.user as UserEntity; // Lấy thông tin người dùng từ request.user sau khi JWT đã được xác thực

    // Trả về chỉ các thông tin cần thiết của user
    return new ResponseDto({
      id: user.id,
      username: user.username,
      email: user.email,
      displayId: user.displayId,
      role: user.role,
      createdAt: user.createdAt,
    });
  }
}
