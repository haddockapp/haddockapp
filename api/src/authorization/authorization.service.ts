import {
  BadRequestException,
  Injectable,
  NotImplementedException
} from '@nestjs/common';
import { AuthorizationRepository } from './authorization.repository';
import { AuthorizationEnum } from './types/authorization.enum';
import { AuthorizationObject } from './types/authorization-object';

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly repository: AuthorizationRepository,
  ) { }

  public async getHeadersForAuthorization(authorizationId: string) {
    const authorization = await this.repository.findById(authorizationId);

    switch (authorization.type) {
      case AuthorizationEnum.OAUTH:
        return {
          Authorization: `Bearer ${authorization.data.token}`,
        };
      case AuthorizationEnum.PERSONAL_ACCESS_TOKEN:
        return {
          Authorization: `token ${authorization.data.token}`,
        };
      case AuthorizationEnum.DEPLOY_KEY:
        throw new BadRequestException('Deploy keys are not supported as Github authorization headers.');
    }
  }

  public async getDeployHeaderForAuthorization(authorizationId: string) {
    const authorization = await this.repository.findById(authorizationId);

    switch (authorization.type) {
      case AuthorizationEnum.DEPLOY_KEY:
        throw NotImplementedException;
      case AuthorizationEnum.OAUTH:
      case AuthorizationEnum.PERSONAL_ACCESS_TOKEN:
        return {
          username: 'x-access-token',
            password: authorization.data.token,
        };

    }
  }

  public async createAuthorization(authorization: AuthorizationObject) {
    return this.repository.createAuthorization(authorization);
  }
}
