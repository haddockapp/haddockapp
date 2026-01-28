import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateAuthorizationDTO,
  DeployKeyData,
  OAuthData,
  PersonalAccessTokenData,
} from './dto/request/create-authorization.dto';
import { AuthorizationEnum } from './types/authorization.enum';
import axios from 'axios';

@Injectable()
export class AuthorizationValidator {
  private validateOAuthCode(code: string) {
    const oauthCodeRegex = /^[a-f0-9]{20}$/;
    if (!oauthCodeRegex.test(code)) {
      throw new BadRequestException('Invalid OAuth code format');
    }
  }

  private validateDeployKey(key: string) {
    const deployKeyRegex =
      /^-----BEGIN (OPENSSH|RSA) PRIVATE KEY-----\n([A-Za-z0-9+/=]+\n)*-----END (OPENSSH|RSA) PRIVATE KEY-----$/;
    if (!deployKeyRegex.test(key)) {
      throw new BadRequestException('Invalid SSH deploy key format');
    }
  }

  private async validatePersonalAccessToken(token: string) {
    try {
      const response = await axios.get('https://api.github.com', {
        headers: {
          Authorization: `token ${token}`,
        },
      });

      const scopesHeader = response.headers['x-oauth-scopes'];

      if (!scopesHeader) {
        throw new Error('GitHub did not return any OAuth scopes');
      }

      const scopes = scopesHeader
        .split(',')
        .map((scope: string) => scope.trim());

      if (!scopes.includes('repo')) {
        throw new Error(
          'Personal Access Token does not have the required "repo" scope to access repositories',
        );
      }
    } catch (error) {
      throw new BadRequestException(
        'Invalid Personal Access Token or insufficient permissions',
      );
    }
  }

  public async validate(authorization: CreateAuthorizationDTO) {
    switch (authorization.type) {
      case AuthorizationEnum.DEPLOY_KEY:
        this.validateDeployKey((authorization.data as DeployKeyData).key);
        break;
      case AuthorizationEnum.OAUTH:
        this.validateOAuthCode((authorization.data as OAuthData).code);
        break;
      case AuthorizationEnum.PERSONAL_ACCESS_TOKEN:
        await this.validatePersonalAccessToken(
          (authorization.data as PersonalAccessTokenData).token,
        );
        break;
    }
  }
}
