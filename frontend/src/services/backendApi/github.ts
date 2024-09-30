import { backendApi } from ".";

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  url: string;
}

export interface Settings {
  branch: string;
  repository: string;
  organization: string;
}

const githubApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllRepositories: builder.query<Repository[], void>({
      query: () => ({
        url: "/github/repository",
      }),
    }),
    getAllBranchesByRepository: builder.query<string[], string>({
      query: (repository: string) => ({
        url: `/github/repository/${repository}/branches`,
      }),
    }),
  }),
});

export const {
  useGetAllRepositoriesQuery,
  useGetAllBranchesByRepositoryQuery,
} = githubApi;
