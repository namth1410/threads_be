import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // constructor(@InjectRedis() private readonly redis: Redis) {}

  getHello(): string {
    return 'Hello World!';
  }

  // async setCache(key: string, value: string): Promise<void> {
  //   await this.redis.set(key, value);
  // }

  // async getCache(key: string): Promise<string | null> {
  //   return await this.redis.get(key);
  // }
}
