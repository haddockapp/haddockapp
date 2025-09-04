import { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { backendApi, QueryKeys } from "..";
import { ServiceDto } from "../services";
import {
  CreateProjectDto,
  EnvironmentVariableDto,
  ProjectDto,
  ServiceAction,
  serviceActionToStatus,
  UpdateProjectDto,
  CreateProjectTokenDto,
  UpdateProjectTokenDto,
  ProjectTokenDto,
} from "./projects.dto";
import { ServiceState } from "@/types/services/services";

export const updateServiceStatus = ({
  dispatch,
  projectId,
  serviceId,
  newStatus,
}: {
  dispatch: ThunkDispatch<any, any, UnknownAction>;
  projectId: string;
  serviceId: string;
  newStatus: ServiceState;
}) =>
  dispatch(
    backendApi.util.updateQueryData(
      "getServicesByProjectId" as never,
      projectId as never,
      (draft) => {
        // Finding the service in the draft
        const services = draft as unknown as ServiceDto[];
        const service = services.find((s) => s.id === serviceId);

        if (!service) return;

        // Updating status if dirty
        if (service && service.status !== newStatus) {
          service.status = newStatus;
          // discarding websocket-injected data
          service.statusDetails = undefined;
        }
      }
    )
  );

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
      { projectId: string; serviceId: string; action: ServiceAction }
    >({
      query: ({ projectId, serviceId, action }) => ({
        url: `/project/${projectId}/service`,
        method: "POST",
        body: { service: serviceId, action },
      }),
      onQueryStarted({ projectId, serviceId, action }, { dispatch }) {
        updateServiceStatus({
          dispatch,
          projectId,
          serviceId,
          newStatus: serviceActionToStatus[action],
        });
      },
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
    // Project Token endpoints
    getProjectTokens: builder.query<ProjectTokenDto[], string>({
      query: (projectId) => ({
        url: `/project/${projectId}/tokens`,
      }),
      providesTags: [QueryKeys.ProjectTokens],
    }),
    createProjectToken: builder.mutation<
      ProjectTokenDto,
      { projectId: string; body: CreateProjectTokenDto }
    >({
      query: ({ projectId, body }) => ({
        url: `/project/${projectId}/tokens`,
        method: "POST",
        body,
      }),
      invalidatesTags: [QueryKeys.ProjectTokens],
    }),
    updateProjectToken: builder.mutation<
      ProjectTokenDto,
      { projectId: string; tokenId: string; body: UpdateProjectTokenDto }
    >({
      query: ({ projectId, tokenId, body }) => ({
        url: `/project/${projectId}/tokens/${tokenId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [QueryKeys.ProjectTokens],
    }),
    deleteProjectToken: builder.mutation<
      void,
      { projectId: string; tokenId: string }
    >({
      query: ({ projectId, tokenId }) => ({
        url: `/project/${projectId}/tokens/${tokenId}`,
        method: "DELETE",
      }),
      invalidatesTags: [QueryKeys.ProjectTokens],
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
  useGetProjectTokensQuery,
  useCreateProjectTokenMutation,
  useUpdateProjectTokenMutation,
  useDeleteProjectTokenMutation,
} = projectsApi;
