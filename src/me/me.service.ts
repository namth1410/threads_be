// src/me/me.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class MeService {
  // Phương thức lấy thông tin người dùng hiện tại
  async getMe(user: any): Promise<string> {
    // Trả về thông tin người dùng đã được xác thực (user)
    return JSON.stringify(user);
  }
}
