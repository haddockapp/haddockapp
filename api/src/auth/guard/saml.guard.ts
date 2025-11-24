import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigurationService } from 'src/configuration/configuration.service';
import { SamlStrategy } from '../strategy/saml.strategy';

@Injectable()
export class SamlAuthGuard extends AuthGuard('saml') {
  constructor(
    private configurationService: ConfigurationService,
    private samlStrategy: SamlStrategy,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if SAML is configured and enabled
    const config = await this.configurationService.getSamlConfiguration();
    if (!config) throw new UnauthorizedException('SAML is not configured');

    // Check if SAML is enabled
    if (!config.enabled)
      throw new ForbiddenException('SAML SSO is currently disabled');

    // Force reload of config in strategy before authentication
    // This ensures the SAML request is created with the latest config from DB
    await this.samlStrategy.loadConfigFromDb();

    return super.canActivate(context) as Promise<boolean>;
  }
}
