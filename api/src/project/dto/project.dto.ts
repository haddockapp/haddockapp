import { Project, Vm, Source, Service } from '@prisma/client';

export type PersistedProjectDto = Project & { vm?: Vm; source?: Source, services?: Service[] };
