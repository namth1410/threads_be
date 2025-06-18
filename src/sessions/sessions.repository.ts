import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { SessionEntity } from './session.entity';

@Injectable()
export class SessionsRepository extends BaseRepository<SessionEntity> {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionEntityRepository: Repository<SessionEntity>,
  ) {
    super(sessionEntityRepository);
  }
}
