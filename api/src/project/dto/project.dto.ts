import { Project, Vm, Source } from '@prisma/client';

export type PersistedProjectDto = Project & { vm?: Vm; source?: Source };
