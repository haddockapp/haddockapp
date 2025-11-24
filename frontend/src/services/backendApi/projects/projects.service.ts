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
} from "./projects.dto";
import { ServiceState } from "@/types/services/services";
import { VmState } from "@/types/vm/vm";

export const updateProjectStatus = ({
  dispatch,
  onSubscribe,
  onUnsubscribe,
  projectId,
  newStatus,
}: {
  dispatch: ThunkDispatch<any, any, UnknownAction>;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  projectId: string;
  newStatus: VmState;
}) =>
  dispatch(
    backendApi.util.updateQueryData(
      "getProjects" as never,
      undefined as never,
      (draftPosts) => {
        const project = (draftPosts as unknown as ProjectDto[]).find(
          ({ id }) => id === projectId
        );
        if (project) {
          project.vm.status = newStatus;
          if (project.vm.status === VmState.Running) onSubscribe();
          else if (project.vm.status === VmState.Stopping && projectId) {
            onUnsubscribe();
          }
        }
      }
    )
  );

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
    uploadProjectZip: builder.mutation<void, { projectId: string; file: File }>(
      {
        query: ({ projectId, file }) => {
          const formData = new FormData();
          formData.append("file", file);
          return {
            url: `/project/zip_upload/${projectId}`,
            method: "POST",
            body: formData,
          };
        },
        invalidatesTags: [QueryKeys.Projects],
      }
    ),
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
  useUploadProjectZipMutation,
} = projectsApi;
