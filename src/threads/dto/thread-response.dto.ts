import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/users/user.entity';
import { Visibility } from '../enums/visibility.enum';
import { MediaEntity } from 'src/minio/media.entity';
import { UserResponseDto } from 'src/auth/dto/user-response.dto';

export class ThreadResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  content: string;

  @ApiProperty({ required: false }) // Đánh dấu là không bắt buộc
  user: UserResponseDto;

  @ApiProperty({ enum: Visibility, default: Visibility.PUBLIC }) // Thêm giá trị mặc định
  visibility: Visibility;

  @ApiProperty({ type: [MediaEntity] })
  media: MediaEntity[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt?: Date;

  constructor(
    id: number,
    content: string,
    visibility: Visibility,
    media: MediaEntity[],
    createdAt: Date,
    user?: UserEntity,
    updatedAt?: Date,
  ) {
    this.id = id;
    this.content = content;
    this.user = new UserResponseDto(user);
    this.visibility = visibility;
    this.media = media;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
