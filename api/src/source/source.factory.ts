import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateGithubSourceDto,
  CreateSourceDto,
  CreateTemplateSourceDto,
  CreateZipUploadSourceDto,
  SourceType,
} from './dto/create-source.dto';
import { SourceDto } from './dto/source.dto';
import { AuthorizationService } from 'src/authorization/authorization.service';
import { TemplatesService } from 'src/templates/templates.service';
import {
  GithubSourceSettingsDto,
  TemplateSourceSettingsDto,
  ZipUploadSourceSettingsDto,
} from './dto/settings.dto';

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
    const settings: GithubSourceSettingsDto = {
      organization: createSourceDto.organization,
      repository: createSourceDto.repository,
      branch: createSourceDto.branch,
      composePath: createSourceDto.compose_path,
    };

    return {
      type: 'github',
      settings: { ...settings },
      authorizationId: createSourceDto.authorization_id,
    };
  }

  private async createZipUploadSource(
    createSourceDto: CreateZipUploadSourceDto,
  ): Promise<SourceDto> {
    const settings: ZipUploadSourceSettingsDto = {
      composePath: createSourceDto.compose_path,
      status: 'none',
    };

    return {
      type: 'zip_upload',
      settings: { ...settings },
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

    try {
      const envVars = await this.templateService.buildTemplateEnvironment(
        createSourceDto.templateId,
        createSourceDto.versionId,
        createSourceDto.variables,
      );

      const settings: TemplateSourceSettingsDto = {
        composePath: templateVersion.compose,
        path: templateVersion.path,
      };

      return {
        type: 'template',
        settings: { ...settings },
        authorizationId: null,
        environmentVars: envVars,
      };
    } catch (error) {
      throw new BadRequestException(
        'Error building template environment variables: ' + error.message,
      );
    }
  }

  async createSource(createSourceDto: CreateSourceDto): Promise<SourceDto> {
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
