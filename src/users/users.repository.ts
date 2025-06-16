import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';

@Injectable()
export class UsersRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
  ) {
    super(userEntityRepository);
  }
}
