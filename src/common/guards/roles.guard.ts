import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Lấy thông tin user từ request

    const roles =
      this.reflector.get<Role[]>(ROLES_KEY, context.getHandler()) || [];

    // Nếu không có role nào được chỉ định, cho phép truy cập
    if (!roles.length) {
      return true;
    }

    // Kiểm tra xem user có vai trò nằm trong danh sách các vai trò hợp lệ không
    if (roles.includes(user.role)) {
      return true;
    } else {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }
  }
}
