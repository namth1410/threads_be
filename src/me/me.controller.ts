// src/me/me.controller.ts

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UserEntity } from 'src/users/user.entity';
import { MeResponseDto } from './dto/me-response.dto';
import { MeService } from './me.service';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @UseGuards(JwtAuthGuard) // Bảo vệ API với guard JWT
  @Get()
  async getMe(@Req() request: Request): Promise<ResponseDto<MeResponseDto>> {
    const user = request.user as UserEntity; // Lấy thông tin người dùng từ request.user sau khi JWT đã được xác thực

    return new ResponseDto(user);
  }
}
