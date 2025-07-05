import { Project, Source, Vm } from "@prisma/client";

export type PersistedVmDto = Vm & { project: Project & { source: Source } };