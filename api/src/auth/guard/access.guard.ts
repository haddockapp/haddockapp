import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_CONFIG_KEY, IS_PUBLIC_KEY } from '../auth.decorator';
import { ConfigurationRepository } from 'src/configuration/configuration.repository';
import { CONFIGURED_KEY } from 'src/configuration/utils/consts';

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly configurationRepository: ConfigurationRepository,
  ) {}

  private isPublicEndpoint(context: ExecutionContext) {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private async isAppConfigured(context: ExecutionContext) {
    const isPublicConfig = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_CONFIG_KEY,
      [context.getHandler(), context.getClass()],
    );

    const config =
      await this.configurationRepository.getConfigurationByKey(CONFIGURED_KEY);
    return isPublicConfig && (!config || (config && config.value === false));
  }

  public async canActivate(context: ExecutionContext) {
    const isPublic = this.isPublicEndpoint(context);
    const isAppConfigured = await this.isAppConfigured(context);

    if (isPublic) return true;
    if (isAppConfigured) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.isActive) {
      throw new UnauthorizedException(`Access denied.`);
    }

    return true;
  }
}
