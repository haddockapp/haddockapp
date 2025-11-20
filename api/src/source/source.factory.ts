import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateGithubSourceDto,
  CreateSourceDto,
  CreateTemplateSourceDto,
  CreateZipUploadSourceDto,
  SourceType,
} from './dto/create-source.dto';
import { CreateSourceRequest, SourceDto } from './dto/source.dto';
import { AuthorizationService } from 'src/authorization/authorization.service';
import { TemplatesService } from 'src/templates/templates.service';

@Injectable()
export class SourceFactory {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly templateService: TemplatesService,
  ) {}

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

  private async createTemplateSource(
    createSourceDto: CreateTemplateSourceDto,
  ): Promise<SourceDto> {
    const templateVersion = await this.templateService.getTemplateVersion(
      createSourceDto.templateId,
      createSourceDto.versionId,
    );

    return {
      type: 'template',
      settings: {
        version: JSON.stringify(templateVersion),
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
      case SourceType.TEMPLATE:
        return this.createTemplateSource(
          createSourceDto as CreateTemplateSourceDto,
        );
      default:
        throw new Error('Invalid source type');
    }
  }
}
