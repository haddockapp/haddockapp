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
      invalidatesTags: [{ type: QueryKeys.Projects, id: "LIST" }],
    }),
    getProjects: builder.query<ProjectDto[], void>({
      query: () => ({
        url: "/project",
      }),
      providesTags: [{ type: QueryKeys.Projects, id: "LIST" }],
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
      invalidatesTags: [{ type: QueryKeys.Projects, id: "LIST" }],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `/project/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: QueryKeys.Projects, id: "LIST" }],
    }),
    getEnvironmentVariables: builder.query<EnvironmentVariableDto[], string>({
      query: (projectId) => ({
        url: `/project/${projectId}/environment`,
      }),
      providesTags: [{ type: QueryKeys.EnvironmentVariables, id: "LIST" }],
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
      invalidatesTags: [{ type: QueryKeys.EnvironmentVariables, id: "LIST" }],
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
      invalidatesTags: [{ type: QueryKeys.EnvironmentVariables, id: "LIST" }],
    }),
    deleteEnvironmentVariable: builder.mutation<
      void,
      { projectId: string; key: string }
    >({
      query: ({ projectId, key }) => ({
        url: `/project/${projectId}/environment/${key}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: QueryKeys.EnvironmentVariables, id: "LIST" }],
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
    }),
    startProject: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `/project/start/${projectId}`,
        method: "POST",
      }),
      invalidatesTags: [{ type: QueryKeys.Projects, id: "LIST" }],
    }),
    stopProject: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `/project/stop/${projectId}`,
        method: "POST",
      }),
      invalidatesTags: [{ type: QueryKeys.Projects, id: "LIST" }],
    }),
    pullProject: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `/project/pull/${projectId}`,
        method: "POST",
      }),
      invalidatesTags: [{ type: QueryKeys.Projects, id: "LIST" }],
    }),
    recreateProject: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `/project/recreate/${projectId}`,
        method: "POST",
      }),
      invalidatesTags: [{ type: QueryKeys.Projects, id: "LIST" }],
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
