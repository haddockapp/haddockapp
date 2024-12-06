// test/mocks/sourceFactory.mocks.ts
import { faker } from '@faker-js/faker';
import { SourceDto } from '../../dto/source.dto';
import { CreateGithubSourceDto, CreateSourceDto } from '../../dto/create-source.dto';
import { Source } from '@prisma/client';
import { AuthorizationEnum } from '../../../authorization/types/authorization.enum';

export const generateCreateGithubSourceDto = (): CreateGithubSourceDto => ({
  type: 'github',
  organization: faker.company.name(),
  repository: faker.company.name(),
  branch: faker.git.branch(),
  authorization: {
    id: faker.string.uuid(),
    type: AuthorizationEnum.OAUTH,
    value: {
      token: faker.string.alphanumeric(32)
    }
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
    type: AuthorizationEnum.OAUTH,
    value: {
      token: createDto.authorization.value,
    }
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
