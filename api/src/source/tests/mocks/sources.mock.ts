// test/mocks/sourceFactory.mocks.ts
import { faker } from '@faker-js/faker';
import { SourceDto } from '../../dto/source.dto';
import { CreateGithubSourceDto, CreateSourceDto } from '../../dto/create-source.dto';
import { Source } from '@prisma/client';

export const generateCreateGithubSourceDto = (): CreateGithubSourceDto => ({
  type: 'github',
  organization: faker.company.name(),
  repository: faker.company.name(),
  branch: faker.git.branch(),
  authorization: {
    id: faker.string.uuid(),
    type: 'oauth',
    userId: faker.string.uuid(),
    value: faker.string.alphanumeric(32),
  },
});

export const generateSourceDto = (createSourceDto: CreateGithubSourceDto): SourceDto => ({
  type: 'github',
  settings: {
    organization: createSourceDto.organization,
    repository: createSourceDto.repository,
    branch: createSourceDto.branch,
  },
  authorizationId: createSourceDto.authorization.id,
});

export const generateSourceFromDto = (createDto: CreateGithubSourceDto) => ({
  id: faker.string.uuid(),
  type: 'github',
  settings: {
    organization: createDto.organization,
    repository: createDto.repository,
    branch: createDto.branch,
  },
  authorizationId: createDto.authorization.id,
  authorization: {
    id: createDto.authorization.id,
    type: 'oauth',
    userId: createDto.authorization.userId,
    value: createDto.authorization.value,
  },
  project: {
    id: faker.string.uuid(),
  }
});

export const generateSource = () => {
  const createDto = generateCreateGithubSourceDto();
  return generateSourceFromDto(createDto);
}



export const generateCreateSourceDto = (): CreateSourceDto => generateCreateGithubSourceDto();
