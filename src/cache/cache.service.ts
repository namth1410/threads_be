import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  // constructor(@InjectRedis() private readonly redis: Redis) {}
  // async setCache(key: string, value: string): Promise<void> {
  //   await this.redis.set(key, value);
  // }
  // async getCache(key: string): Promise<string | null> {
  //   return await this.redis.get(key);
  // }
}
