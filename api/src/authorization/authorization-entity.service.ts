import {
  Injectable
} from '@nestjs/common';
import { AuthorizationMapper } from './authorization.mapper';
import { AuthorizationRepository } from './authorization.repository';
import { AuthorizationResponse } from './dto/authorization.response';
import { CreateAuthorizationDTO } from './dto/request/create-authorization.dto';

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

  public async create(body: CreateAuthorizationDTO) {
    return body;
  }
}
