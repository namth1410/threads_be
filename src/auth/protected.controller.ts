import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('protected')
export class ProtectedController {
  @UseGuards(JwtAuthGuard) // Sử dụng guard để bảo vệ endpoint này
  @Get()
  getProtectedData() {
    return { message: 'This is protected data' };
  }
}
