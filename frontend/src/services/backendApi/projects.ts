import { Source } from "@/types/source";
import { VMInfos } from "@/types/vm/vm";
import { backendApi } from ".";

export interface CreateProjectDto {
  repository_organisation: string;
  repository_name: string;
  repository_branch: string;
  vm_memory: number;
  vm_disk: number;
  vm_cpus: number;
  compose_name: string;
}

export enum VmProvider {
  Libvirt = "libvirt",
  VirtualBox = "virtualbox",
}

export enum VmState {
  Starting = "starting",
  Running = "running",
  Stopped = "stopped",
}

export interface ProjectDto {
  id: string;
  sourceId: string;
  vmId: string;
  vm: VMInfos;
  source: Source;
}

export interface NetworkConnectionDto {
  projectId: string;
  port: number;
  domain: string;
}

const projectsApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    createProject: builder.mutation<ProjectDto, CreateProjectDto>({
      query: (body) => ({
        url: "/project",
        method: "POST",
        body,
      }),
    }),
    getProjects: builder.query<ProjectDto[], void>({
      query: () => ({
        url: "/project",
      }),
    }),
  }),
});

export const { useCreateProjectMutation, useGetProjectsQuery } = projectsApi;
