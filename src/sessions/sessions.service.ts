import { Injectable } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';
import { SessionEntity } from './session.entity';
import { SessionsRepository } from './sessions.repository';

@Injectable()
export class SessionsService {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async getByCriteria(
    options: FindOneOptions<SessionEntity>,
  ): Promise<SessionEntity | null> {
    return this.sessionsRepository.findOneByOptions(options);
  }

  async deleteSession(criteria: Partial<SessionEntity>): Promise<void> {
    const session = await this.sessionsRepository.getEntityByCriteria(criteria);
    if (!session) {
      // Không ném lỗi nếu không có session
      return;
    }
    await this.sessionsRepository.deleteEntity({ id: session.id });
  }

  async createSession(params: {
    userId: number;
    token: string;
    refreshToken: string;
    expiresInMs?: number; // Cho phép tuỳ chỉnh thời gian hết hạn
  }): Promise<SessionEntity> {
    const {
      userId,
      token,
      refreshToken,
      expiresInMs = 1000 * 60 * 60 * 24,
    } = params; // Mặc định 24h

    return await this.sessionsRepository.createEntity({
      userId,
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + expiresInMs),
    });
  }
}
