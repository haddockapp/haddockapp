import { backendApi, QueryKeys } from ".";

export interface CreateDomainDto {
  domain: string;

  main: boolean;
}

export interface DomainDto {
  id: string;
  domain: string;
  main: boolean;

  primaryBinding: string;
  wildcardBinding: string;
  challengeBinding: string;
}

export type DomainResponseDto = DomainDto & { linked: boolean };
export type DomainStatusDto = DomainDto & { canBeLinked: boolean };

const domainsApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    createDomain: builder.mutation<DomainResponseDto, CreateDomainDto>({
      query: (body) => ({
        url: "/domains",
        method: "POST",
        body,
      }),
      invalidatesTags: [QueryKeys.Domains],
    }),
    getAllDomains: builder.query<DomainResponseDto[], void>({
      query: () => ({
        url: "/domains",
      }),
      providesTags: [QueryKeys.Domains],
    }),
    getDomain: builder.query<DomainResponseDto, string>({
      query: (id) => ({
        url: `/domains/${id}`,
      }),
      providesTags: [QueryKeys.Domains],
    }),
    getDomainStatus: builder.query<DomainStatusDto, string>({
      query: (id) => ({
        url: `/domains/${id}/status`,
      }),
      providesTags: [QueryKeys.Domains],
    }),
    deleteDomain: builder.mutation<void, string>({
      query: (id) => ({
        url: `/domains/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [QueryKeys.Domains],
    }),
  }),
});

export const {
  useCreateDomainMutation,
  useGetAllDomainsQuery,
  useGetDomainQuery,
  useGetDomainStatusQuery,
  useDeleteDomainMutation,
} = domainsApi;
