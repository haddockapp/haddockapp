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
  name: string;
  description?: string;
  vmId: string;
  vm: VMInfos;
  source: Source;
}

export interface NetworkConnectionDto {
  projectId: string;
  port: number;
  domain: string;
}

export interface UpdateProjectDto {
  repository_branch?: string;
  vcpu?: number;
  ram?: number;
  name?: string;
  description?: string;
}

const projectsApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    createProject: builder.mutation<ProjectDto, CreateProjectDto>({
      query: (body) => ({
        url: "/project",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),
    getProjects: builder.query<ProjectDto[], void>({
      query: () => ({
        url: "/project",
      }),
      providesTags: [{ type: "Projects", id: "LIST" }],
    }),
    updateProject: builder.mutation<
      ProjectDto,
      { projectId: string; body: UpdateProjectDto }
    >({
      query: ({ projectId, body }) => ({
        url: `/project/${projectId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `/project/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;
