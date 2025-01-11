import { Module } from '@nestjs/common';
import {
  CacheModule as CacheModul,
  CacheModuleAsyncOptions,
} from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { redisStore } from 'cache-manager-redis-store';

const redisOpts: CacheModuleAsyncOptions = {
  useFactory: async () => {
    const store = await redisStore({
      socket: {
        host: 'localhost',
        port: 6379,
      },
    });
    return {
      store: () => store,
    };
  },
};

@Module({
  imports: [CacheModul.registerAsync(redisOpts)],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
