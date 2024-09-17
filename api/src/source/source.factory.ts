import { Injectable } from '@nestjs/common';
import { CreateGithubSourceDto, CreateSourceDto } from './dto/create-source.dto';
import { CreateSourceRequest, SourceDto } from './dto/source.dto';

@Injectable()
export class SourceFactory {

  private createGithubSource(createSourceDto: CreateGithubSourceDto): SourceDto {
    return {
      type: 'github',
      settings: {
        organization: createSourceDto.organization,
        repository: createSourceDto.repository,
        branch: createSourceDto.branch
      },
      authorizationId: createSourceDto.authorization.id
    }
  }


  createSource(createSourceDto: CreateSourceDto): CreateSourceRequest {
    switch (createSourceDto.type) {
      case 'github':
        return this.createGithubSource(createSourceDto);
      default:
        throw new Error('Invalid source type');
    }
  }
}