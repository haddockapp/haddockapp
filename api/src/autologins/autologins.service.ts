import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class AutologinsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) { }

  async generateToken(userId: string): Promise<string> {
    const token = uuidv4();
    await this.cacheManager.set(`autologin:${token}`, userId, 24 * 60 * 60 * 1000);
    return token;
  }

  async authWithToken(token: string) {
    const userId = await this.cacheManager.get<string>(`autologin:${token}`);

    if (!userId) {
      throw new UnauthorizedException('Invalid or expired autologin token');
    }

    await this.cacheManager.del(`autologin:${token}`);

    const user = await this.userRepository.findById(userId);

    return { accessToken: this.authService.generateJwt(user) };
  }
}
