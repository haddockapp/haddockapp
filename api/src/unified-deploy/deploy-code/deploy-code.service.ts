import { Injectable, UnauthorizedException } from '@nestjs/common';
import Redis from 'ioredis';
import { randomInt } from 'node:crypto';

@Injectable()
export class DeployCodeService {
  private readonly redis: Redis;
  private readonly GLOBAL_CODE_KEY = 'app:global_deploy_code';
  private readonly TTL = 900; // 15 minutes

  constructor() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async generateOrGetCode(): Promise<string> {
    const existingCode = await this.redis.get(this.GLOBAL_CODE_KEY);

    if (existingCode) {
      return existingCode;
    }

    const newCode = randomInt(100000, 999999).toString();

    await this.redis
      .pipeline()
      .set(this.GLOBAL_CODE_KEY, newCode, 'EX', this.TTL)
      .exec();

    return newCode;
  }

  async validate(providedCode: string): Promise<void> {
    const currentCode = await this.redis.get(this.GLOBAL_CODE_KEY);

    if (!currentCode || currentCode !== providedCode) {
      throw new UnauthorizedException(
        'Invalid, expired, or already used deploy code',
      );
    }
  }
}
