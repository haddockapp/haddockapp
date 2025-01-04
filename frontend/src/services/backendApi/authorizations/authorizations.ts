import { backendApi, QueryKeys } from "..";
import { Authorization, AuthorizationCreateDto } from "./authorizations.dto";

const authorizationApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAuthorizations: builder.query<Authorization[], void>({
      query: () => ({
        url: "/authorization",
        method: "GET",
      }),
      providesTags: [QueryKeys.Authorizations],
    }),
    createAuthorization: builder.mutation<
      Authorization,
      AuthorizationCreateDto
    >({
      query: (body) => ({
        url: "/authorization",
        method: "POST",
        body,
      }),
      invalidatesTags: [QueryKeys.Authorizations],
    }),
    deleteAuthorization: builder.mutation<void, string>({
      query: (id) => ({
        url: `/authorization/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [QueryKeys.Authorizations],
    }),
  }),
});

export const {
  useGetAllAuthorizationsQuery,
  useCreateAuthorizationMutation,
  useDeleteAuthorizationMutation,
} = authorizationApi;
