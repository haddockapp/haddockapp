import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateGithubSourceDto,
  CreateSourceDto,
  CreateZipUploadSourceDto,
  SourceType,
} from './dto/create-source.dto';
import { CreateSourceRequest, SourceDto } from './dto/source.dto';
import { AuthorizationService } from 'src/authorization/authorization.service';

@Injectable()
export class SourceFactory {
  constructor(private readonly authorizationService: AuthorizationService) {}

  private async createGithubSource(
    createSourceDto: CreateGithubSourceDto,
  ): Promise<SourceDto> {
    const canReadSource = await this.authorizationService.canReadSource(
      createSourceDto.authorization_id,
      createSourceDto.organization,
      createSourceDto.repository,
    );
    if (!canReadSource) {
      throw new BadRequestException(
        'Provided authorization does not have access to the repository.',
      );
    }

    return {
      type: 'github',
      settings: {
        organization: createSourceDto.organization,
        repository: createSourceDto.repository,
        branch: createSourceDto.branch,
        composePath: createSourceDto.compose_path,
      },
      authorizationId: createSourceDto.authorization_id,
    };
  }

  private async createZipUploadSource(
    createSourceDto: CreateZipUploadSourceDto,
  ): Promise<SourceDto> {
    return {
      type: 'zip_upload',
      settings: {
        composePath: createSourceDto.compose_path,
        status: 'none',
      },
      authorizationId: null,
    };
  }

  async createSource(
    createSourceDto: CreateSourceDto,
  ): Promise<CreateSourceRequest> {
    switch (createSourceDto.type) {
      case SourceType.GITHUB:
        return this.createGithubSource(
          createSourceDto as CreateGithubSourceDto,
        );
      case SourceType.ZIP_UPLOAD:
        return this.createZipUploadSource(
          createSourceDto as CreateZipUploadSourceDto,
        );
      default:
        throw new Error('Invalid source type');
    }
  }
}
