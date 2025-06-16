import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';
import { UserEntity } from 'src/users/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty()
  displayId: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  createdAt: Date;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.displayId = user.displayId;
    this.role = user.role;
    this.createdAt = user.createdAt;
  }
}
