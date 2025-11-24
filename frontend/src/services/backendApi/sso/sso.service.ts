import { backendApi, QueryKeys } from "..";
import { SSOConfigurationDto } from "./sso.dto";

const ssoApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getSSOConfiguration: builder.query<SSOConfigurationDto | null, void>({
      query: () => ({
        url: "/configuration/saml",
        method: "GET",
      }),
      providesTags: [QueryKeys.Configurations],
    }),
    updateSSOConfiguration: builder.mutation<void, SSOConfigurationDto>({
      query: (body) => ({
        url: "/configuration/saml",
        method: "POST",
        body,
      }),
      invalidatesTags: [QueryKeys.Configurations],
    }),
    testSSOConfiguration: builder.mutation<
      { success: boolean; message?: string },
      void
    >({
      query: () => ({
        url: "/configuration/saml/test",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetSSOConfigurationQuery,
  useUpdateSSOConfigurationMutation,
  useTestSSOConfigurationMutation,
} = ssoApi;
