import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { ThreadEntity } from './thread.entity';

@Injectable()
export class ThreadsRepository extends BaseRepository<ThreadEntity> {
  constructor(
    @InjectRepository(ThreadEntity)
    private readonly threadEntityRepository: Repository<ThreadEntity>,
  ) {
    super(threadEntityRepository);
  }
}
