import { backendApi } from "..";
import {
  Repository,
  GetAllRepositoriesParams,
  GetAllBranchesByRepositoryParams,
  GetRepositoryByNameParam,
} from "./github.dto";

const githubApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllRepositories: builder.query<Repository[], GetAllRepositoriesParams>({
      query: (params) => ({
        url: "/github/repository",
        params,
      }),
    }),
    getAllBranchesByRepository: builder.query<
      string[],
      GetAllBranchesByRepositoryParams
    >({
      query: ({ repository, ...params }) => ({
        url: `/github/repository/${repository}/branches`,
        params,
      }),
    }),
    getRepositoryByName: builder.query<Repository, GetRepositoryByNameParam>({
      query: ({ organization, repository, ...params }) => ({
        url: `/github/repository/${organization}/${repository}`,
        params,
      }),
    }),
  }),
});

export const {
  useGetAllRepositoriesQuery,
  useGetAllBranchesByRepositoryQuery,
  useGetRepositoryByNameQuery,
} = githubApi;
