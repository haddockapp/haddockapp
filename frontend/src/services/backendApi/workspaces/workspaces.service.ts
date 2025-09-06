import { backendApi, QueryKeys } from "..";
import { CreateWorkspaceDto, WorkspaceDto } from "./workspaces.dto";

const workspacesApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaces: builder.query<WorkspaceDto[], void>({
      query: () => ({ url: "/workspaces" }),
      providesTags: [QueryKeys.Workspaces],
    }),
    createWorkspace: builder.mutation<WorkspaceDto, CreateWorkspaceDto>({
      query: (body) => ({ url: "/workspaces", method: "POST", body }),
      invalidatesTags: [QueryKeys.Workspaces],
    }),
    deleteWorkspace: builder.mutation<void, string>({
      query: (workspaceId) => ({
        url: `/workspaces/${workspaceId}`,
        method: "DELETE",
      }),
      invalidatesTags: [QueryKeys.Workspaces],
    }),
  }),
});

export const {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useDeleteWorkspaceMutation,
} = workspacesApi;
