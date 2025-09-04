import { ServiceState } from "@/types/services/services";
import { Source } from "@/types/source";
import { VMInfos } from "@/types/vm/vm";

export enum ServiceAction {
  START = "start",
  STOP = "stop",
  RESTART = "restart",
}

export const serviceActionToStatus: Record<ServiceAction, ServiceState> = {
  [ServiceAction.START]: ServiceState.Running,
  [ServiceAction.STOP]: ServiceState.Stopped,
  [ServiceAction.RESTART]: ServiceState.Starting,
};

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

export enum TokenPermission {
  READ = 'read',
  START = 'start', 
  STOP = 'stop',
  DEPLOY = 'deploy',
  RECREATE = 'recreate',
  MANAGE_SERVICES = 'manage_services',
  MANAGE_ENVIRONMENT = 'manage_environment',
}

export type CreateProjectTokenDto = {
  name: string;
  permissions: TokenPermission[];
  expiresAt?: string;
};

export type UpdateProjectTokenDto = {
  name?: string;
  permissions?: TokenPermission[];
  isActive?: boolean;
  expiresAt?: string;
};

export type ProjectTokenDto = {
  id: string;
  name: string;
  token?: string; // Only included when creating
  permissions: TokenPermission[];
  isActive: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
};
