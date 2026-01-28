import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { AuthorizationRepository } from './authorization.repository';
import { AuthorizationEnum } from './types/authorization.enum';
import { AuthorizationDTO } from './dto/authorization.dto';
import { AuthorizationMapper } from './authorization.mapper';
import axios from 'axios';

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly repository: AuthorizationRepository,
    private readonly mapper: AuthorizationMapper,
  ) {}

  public async getAuthorizationType(
    authorizationId: string,
  ): Promise<AuthorizationEnum> {
    const authorization = await this.repository.findById(authorizationId);
    const object = this.mapper.toAuthorizationObject(authorization);
    return object.type;
  }

  public async getAuthorizationKey(authorizationId: string): Promise<string> {
    const authorization = await this.repository.findById(authorizationId);
    const object = this.mapper.toAuthorizationObject(authorization);

    switch (object.type) {
      case AuthorizationEnum.DEPLOY_KEY:
        return object.data.key;
      case AuthorizationEnum.OAUTH:
      case AuthorizationEnum.PERSONAL_ACCESS_TOKEN:
        throw NotImplementedException;
    }
  }

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
        throw new BadRequestException(
          'Deploy keys are not supported as Github authorization headers.',
        );
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

  private async readSource(
    authorizationId: string,
    organization: string,
    repo: string,
  ) {
    const authorizationHeaders =
      await this.getHeadersForAuthorization(authorizationId);

    try {
      await axios.get(`https://api.github.com/repos/${organization}/${repo}`, {
        headers: authorizationHeaders,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private isPublicRepo(organization: string, repo: string) {
    return axios
      .get(`https://api.github.com/repos/${organization}/${repo}`)
      .then(() => true)
      .catch(() => false);
  }

  public async canReadSource(
    authorizationId: string | null,
    organization: string,
    repo: string,
  ) {
    if (!authorizationId) {
      return this.isPublicRepo(organization, repo);
    }
    const authorization = await this.repository.findById(authorizationId);
    const object = this.mapper.toAuthorizationObject(authorization);

    switch (object.type) {
      case AuthorizationEnum.OAUTH:
        return this.readSource(authorizationId, organization, repo);
      case AuthorizationEnum.PERSONAL_ACCESS_TOKEN:
        return this.readSource(authorizationId, organization, repo);
      case AuthorizationEnum.DEPLOY_KEY:
        return true;
    }
  }
}
