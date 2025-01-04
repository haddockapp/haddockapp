import { Source } from "@/types/source";
import { VMInfos } from "@/types/vm/vm";

export type CreateProjectDto = {
  repository_organisation: string;
  repository_name: string;
  repository_branch: string;
  vm_memory: number;
  vm_disk: number;
  vm_cpus: number;
  compose_name: string;
  authorization_id: string;
};

export type ProjectDto = {
  id: string;
  sourceId: string;
  name: string;
  description?: string;
  vmId: string;
  vm: VMInfos;
  source: Source;
};

export type UpdateProjectDto = {
  repository_branch?: string;
  vcpu?: number;
  ram?: number;
  name?: string;
  description?: string;
};
