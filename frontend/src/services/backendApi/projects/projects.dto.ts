import { Source } from "@/types/source";
import { VMInfos } from "@/types/vm/vm";

export type CreateProjectDto = {
  repository_organisation: string;
  repository_name: string;
  repository_branch: string;
  vm_memory: number;
  vm_disk: number;
  vm_cpus: number;
  compose_path: string;
  authorization_id?: string;
};

export type ProjectDto = {
  id: string;
  sourceId: string;
  name: string;
  authorizationId?: string;
  description?: string;
  vmId: string;
  vm: VMInfos;
  source: Source;
};

export type UpdateProjectDto = {
  name?: string;
  description?: string;
  authorization_id?: string;
};

export type EnvironmentVariableDto = {
  key: string;
  value: string;
  isSecret: boolean;
};
