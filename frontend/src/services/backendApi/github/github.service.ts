import { backendApi } from "..";
import {
  Repository,
  GetAllRepositoriesParams,
  GetAllBranchesByRepositoryParams,
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
  }),
});

export const {
  useGetAllRepositoriesQuery,
  useGetAllBranchesByRepositoryQuery,
} = githubApi;
