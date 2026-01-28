import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthError } from '../auth/error/AuthError';
import { GithubService } from '../github/github.service';
import { AuthorizationMapper } from './authorization.mapper';
import { AuthorizationRepository } from './authorization.repository';
import { AuthorizationService } from './authorization.service';
import { AuthorizationDTO } from './dto/authorization.dto';
import { AuthorizationResponse } from './dto/authorization.response';
import {
  CreateAuthorizationDTO,
  DeployKeyData,
  OAuthData,
  PersonalAccessTokenData,
} from './dto/request/create-authorization.dto';
import { AuthorizationEnum } from './types/authorization.enum';

@Injectable()
export class AuthorizationEntityService {
  constructor(
    private readonly repository: AuthorizationRepository,
    private readonly mapper: AuthorizationMapper,
    private readonly githubService: GithubService,
    private readonly service: AuthorizationService,
  ) {}

  private async getOAuthToken(code: string): Promise<string> {
    try {
      return await this.githubService.exchangeCode(code);
    } catch (error) {
      if (error instanceof AuthError) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException('An error occurred.');
      }
    }
  }

  private async requestToAuthorizationObject(
    authorization: CreateAuthorizationDTO,
  ): Promise<AuthorizationDTO> {
    switch (authorization.type) {
      case AuthorizationEnum.OAUTH:
        return {
          name: authorization.name,
          type: AuthorizationEnum.OAUTH,
          data: {
            token: await this.getOAuthToken(
              (authorization.data as OAuthData).code,
            ),
          },
        };
      case AuthorizationEnum.PERSONAL_ACCESS_TOKEN:
        return {
          name: authorization.name,
          type: AuthorizationEnum.PERSONAL_ACCESS_TOKEN,
          data: {
            token: (authorization.data as PersonalAccessTokenData).token,
          },
        };
      case AuthorizationEnum.DEPLOY_KEY:
        return {
          name: authorization.name,
          type: AuthorizationEnum.DEPLOY_KEY,
          data: {
            key: (authorization.data as DeployKeyData).key,
          },
        };
    }
  }

  public async findAll(): Promise<AuthorizationResponse[]> {
    const authorizations = await this.repository.findAll();
    return authorizations.map((authorization) =>
      this.mapper.toResponse(authorization),
    );
  }

  public async findById(id: string): Promise<AuthorizationResponse> {
    const authorization = await this.repository.findById(id);
    return this.mapper.toResponse(authorization);
  }

  public async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  public async create(body: CreateAuthorizationDTO) {
    const authorization = await this.requestToAuthorizationObject(body);
    return this.service.createAuthorization(authorization);
  }
}
