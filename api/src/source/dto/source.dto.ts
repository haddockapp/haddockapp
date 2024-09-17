import { Authorization, Project, Source } from "@prisma/client";

export type CreateSourceRequest = Omit<Source, 'id'>
export type SourceDto = Omit<Source, 'id'> & { authorization?: Authorization }
export type PersistedSourceDto = Source & { authorization?: Authorization, project?: Project }