import {
  BadRequestException,
  Injectable,
  NotImplementedException
} from '@nestjs/common';
import { AuthorizationRepository } from './authorization.repository';
import { AuthorizationEnum } from './types/authorization.enum';
import { AuthorizationObject } from './types/authorization-object';
import { AuthorizationResponse } from './types/authorization.response';
import { AuthorizationMapper } from './authorization.mapper';

@Injectable()
export class AuthorizationEntityService {
  constructor(
    private readonly repository: AuthorizationRepository,
    private readonly mapper: AuthorizationMapper
  ) { }

  public async findAll(): Promise<AuthorizationResponse[]> {
    const authorizations = await this.repository.findAll();
    return authorizations.map((authorization) => this.mapper.toResponse(authorization));
  }

  public async findById(id: string): Promise<AuthorizationResponse> {
    const authorization = await this.repository.findById(id);
    return this.mapper.toResponse(authorization);
  }

  public async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
