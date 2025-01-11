import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RedisStore } from 'cache-manager-redis-store';

@Injectable()
export class CacheService {
  private readonly redisStore: RedisStore;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.redisStore = cacheManager.store as unknown as RedisStore;
  }

  async setInvitation(code: string, email: string) {
    await this.cacheManager.set(`invitation:${code}`, email);
  }

  async getInvitation(code: string) {
    return await this.cacheManager.get<string>(`invitation:${code}`);
  }

  async delInvitation(code: string) {
    await this.cacheManager.del(`invitation:${code}`);
  }

  async setPasswordReset(code: string, userId: string) {
    await this.cacheManager.set(`password_reset:${code}`, userId);
  }

  async getPasswordReset(code: string) {
    return await this.cacheManager.get<string>(`password_reset:${code}`);
  }

  async delPasswordReset(code: string) {
    await this.cacheManager.del(`password_reset:${code}`);
  }
}
