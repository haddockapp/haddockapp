import { backendApi } from "@/services/backendApi";
import { VersionInfo } from "./version.dto";

const versionApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getVersion: builder.query<VersionInfo, void>({
      query: () => ({
        url: "/version",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetVersionQuery } = versionApi;

