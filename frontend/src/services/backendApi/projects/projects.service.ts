import { backendApi, QueryKeys } from "..";
import { CreateProjectDto, ProjectDto, UpdateProjectDto } from "./projects.dto";

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
  }),
});

export const {
  useCreateProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;
