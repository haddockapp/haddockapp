import { Authorization, Project, Source } from '@prisma/client';
import { EnvironmentVar } from 'src/project/dto/environmentVar';

export type SourceDto = Omit<Source, 'id'> & {
  environmentVars?: EnvironmentVar[];
};
export type CreatedSource = Source & { environmentVars?: EnvironmentVar[] };
// export type SourceDto = Omit<Source, 'id'> & { authorization?: Authorization }
export type PersistedSourceDto = Source & {
  authorization?: Authorization;
  project?: Project;
};
