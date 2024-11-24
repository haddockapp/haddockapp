import { backendApi } from "./backendApi";

const domainApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getDomains: builder.query<string[], void>({
      query: () => ({
        url: "/domains",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetDomainsQuery } = domainApi;
