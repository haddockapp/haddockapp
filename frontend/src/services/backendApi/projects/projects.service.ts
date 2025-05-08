import { backendApi, QueryKeys } from "..";
import {
  CreateProjectDto,
  EnvironmentVariableDto,
  ProjectDto,
  ServiceAction,
  UpdateProjectDto,
} from "./projects.dto";

const projectsApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    createProject: builder.mutation<ProjectDto, CreateProjectDto>({
      query: (body) => ({
        url: "/project",
        method: "POST",
        body,
      }),
      invalidatesTags: [QueryKeys.Projects],
    }),
    getProjects: builder.query<ProjectDto[], void>({
      query: () => ({
        url: "/project",
      }),
      providesTags: [QueryKeys.Projects],
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
      invalidatesTags: [QueryKeys.Projects],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `/project/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: [QueryKeys.Projects],
    }),
    getEnvironmentVariables: builder.query<EnvironmentVariableDto[], string>({
      query: (projectId) => ({
        url: `/project/${projectId}/environment`,
      }),
      providesTags: [QueryKeys.EnvironmentVariables],
    }),
    createEnvironmentVariable: builder.mutation<
      EnvironmentVariableDto,
      { projectId: string; body: EnvironmentVariableDto }
    >({
      query: ({ projectId, body }) => ({
        url: `/project/${projectId}/environment`,
        method: "POST",
        body,
      }),
      invalidatesTags: [QueryKeys.EnvironmentVariables],
    }),
    updateEnvironmentVariable: builder.mutation<
      EnvironmentVariableDto,
      { projectId: string; key: string; body: EnvironmentVariableDto }
    >({
      query: ({ projectId, key, body }) => ({
        url: `/project/${projectId}/environment/${key}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [QueryKeys.EnvironmentVariables],
    }),
    deleteEnvironmentVariable: builder.mutation<
      void,
      { projectId: string; key: string }
    >({
      query: ({ projectId, key }) => ({
        url: `/project/${projectId}/environment/${key}`,
        method: "DELETE",
      }),
      invalidatesTags: [QueryKeys.EnvironmentVariables],
    }),
    changeServiceStatus: builder.mutation<
      void,
      { projectId: string; serviceName: string; action: ServiceAction }
    >({
      query: ({ projectId, serviceName, action }) => ({
        url: `/project/${projectId}/service`,
        method: "POST",
        body: { service: serviceName, action },
      }),
      invalidatesTags: [QueryKeys.Projects],
    }),
    startProject: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `/project/start/${projectId}`,
        method: "POST",
      }),
      invalidatesTags: [QueryKeys.Projects],
    }),
    stopProject: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `/project/stop/${projectId}`,
        method: "POST",
      }),
      invalidatesTags: [QueryKeys.Projects],
    }),
    pullProject: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `/project/pull/${projectId}`,
        method: "POST",
      }),
      invalidatesTags: [QueryKeys.Projects],
    }),
    recreateProject: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `/project/recreate/${projectId}`,
        method: "POST",
      }),
      invalidatesTags: [QueryKeys.Projects],
    }),
  }),
});

export const {
  useCreateProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetEnvironmentVariablesQuery,
  useCreateEnvironmentVariableMutation,
  useUpdateEnvironmentVariableMutation,
  useDeleteEnvironmentVariableMutation,
  useChangeServiceStatusMutation,
  useStartProjectMutation,
  useStopProjectMutation,
  usePullProjectMutation,
  useRecreateProjectMutation,
} = projectsApi;
