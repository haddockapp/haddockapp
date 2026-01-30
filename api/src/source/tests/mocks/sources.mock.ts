// test/mocks/sourceFactory.mocks.ts
import { faker } from '@faker-js/faker';
import { SourceDto } from '../../dto/source.dto';
import {
  CreateGithubSourceDto,
  CreateSourceDto,
  SourceType,
} from '../../dto/create-source.dto';

export const generateCreateGithubSourceDto = (): CreateGithubSourceDto => ({
  type: SourceType.GITHUB,
  organization: faker.company.name(),
  repository: faker.company.name(),
  branch: faker.git.branch(),
  compose_path: 'docker-compose.yml',
  authorization_id: faker.string.uuid(),
  environmentVars: [],
});

export const generateSourceDto = (
  createSourceDto: CreateGithubSourceDto,
): SourceDto => ({
  type: SourceType.GITHUB,
  settings: {
    organization: createSourceDto.organization,
    repository: createSourceDto.repository,
    branch: createSourceDto.branch,
  },
  authorizationId: createSourceDto.authorization_id,
});

export const generateSourceFromDto = (createDto: CreateGithubSourceDto) => ({
  id: faker.string.uuid(),
  type: SourceType.GITHUB,
  settings: {
    organization: createDto.organization,
    repository: createDto.repository,
    branch: createDto.branch,
  },
  authorizationId: createDto.authorization_id,
  project: {
    id: faker.string.uuid(),
  },
});

export const generateSource = () => {
  const createDto = generateCreateGithubSourceDto();
  return generateSourceFromDto(createDto);
};

export const generateCreateSourceDto = (): CreateSourceDto =>
  generateCreateGithubSourceDto();
