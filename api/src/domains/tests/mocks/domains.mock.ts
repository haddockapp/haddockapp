import { faker } from '@faker-js/faker';

import { Domain } from '@prisma/client';
import { CreateDomainDto } from '../../dto/create-domain.dto';

export const generateCreateDomainDto = (): CreateDomainDto => ({
  domain: faker.internet.domainName(),
  main: faker.datatype.boolean(),
});

export const generateMockDomain = (): Domain => ({
  id: faker.string.uuid(),
  domain: faker.internet.domainName(),
  challenge: faker.string.alphanumeric(32),
  main: faker.datatype.boolean(),
  linked: faker.datatype.boolean(),
  https: true,
});

export const createDtoFromDomain = (domain: Domain): CreateDomainDto => ({
  domain: domain.domain,
  main: domain.main,
});
