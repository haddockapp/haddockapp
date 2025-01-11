import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_CONFIG_KEY, IS_PUBLIC_KEY } from '../auth.decorator';
import { ConfigurationRepository } from 'src/configuration/configuration.repository';
import { CONFIGURED_KEY } from 'src/configuration/utils/consts';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly configurationRepository: ConfigurationRepository,
  ) {
    super();
  }

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
    return isPublicConfig && config && config.value === true;
  }

  public async canActivate(context: ExecutionContext) {
    const isPublic = this.isPublicEndpoint(context);
    const isAppConfigured = await this.isAppConfigured(context);

    if (isPublic) return true;
    if (isAppConfigured) return true;
    return super.canActivate(context) as boolean;
  }
}
