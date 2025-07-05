import { Authorization } from '@prisma/client';

export class CreateGithubSourceDto {
  type: 'github';

  authorization: Authorization;

  organization: string;

  repository: string;

  branch: string;
}

export type CreateSourceDto = CreateGithubSourceDto;
