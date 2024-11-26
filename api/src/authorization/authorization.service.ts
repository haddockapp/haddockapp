import {
  BadRequestException,
  Injectable,
  NotImplementedException
} from '@nestjs/common';
import { AuthorizationRepository } from './authorization.repository';
import { AuthorizationEnum } from './types/authorization.enum';
import { AuthorizationDTO } from './dto/authorization.dto';
import { AuthorizationMapper } from './authorization.mapper';

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly repository: AuthorizationRepository,
    private readonly mapper: AuthorizationMapper
  ) { }

  public async getHeadersForAuthorization(authorizationId: string) {
    const authorization = await this.repository.findById(authorizationId);
    const object = this.mapper.toAuthorizationObject(authorization);

    switch (object.type) {
      case AuthorizationEnum.OAUTH:
        return {
          Authorization: `Bearer ${object.data.token}`,
        };
      case AuthorizationEnum.PERSONAL_ACCESS_TOKEN:
        return {
          Authorization: `token ${object.data.token}`,
        };
      case AuthorizationEnum.DEPLOY_KEY:
        throw new BadRequestException('Deploy keys are not supported as Github authorization headers.');
    }
  }

  public async getDeployHeaderForAuthorization(authorizationId: string) {
    const authorization = await this.repository.findById(authorizationId);
    const object = this.mapper.toAuthorizationObject(authorization);

    switch (object.type) {
      case AuthorizationEnum.DEPLOY_KEY:
        throw NotImplementedException;
      case AuthorizationEnum.OAUTH:
      case AuthorizationEnum.PERSONAL_ACCESS_TOKEN:
        return {
          username: 'x-access-token',
          password: object.data.token,
        };

    }
  }

  public async createAuthorization(authorization: AuthorizationDTO) {
    return this.repository.createAuthorization(authorization);
  }
}
