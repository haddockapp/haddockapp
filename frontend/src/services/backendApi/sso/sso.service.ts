import { backendApi, QueryKeys } from "..";
import {
  SSOConfigurationInputDto,
  SSOConfigurationResponseDto,
  ToggleSSODto,
  SSOTestResponseDto,
} from "./sso.dto";

const ssoApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getSSOConfiguration: builder.query<
      SSOConfigurationResponseDto | null,
      void
    >({
      query: () => ({
        url: "/configuration/saml",
        method: "GET",
      }),
      providesTags: [QueryKeys.Configurations],
    }),
    updateSSOConfiguration: builder.mutation<void, SSOConfigurationInputDto>({
      query: (body) => ({
        url: "/configuration/saml",
        method: "POST",
        body,
      }),
      invalidatesTags: [QueryKeys.Configurations],
    }),
    patchSSOConfiguration: builder.mutation<void, SSOConfigurationInputDto>({
      query: (body) => ({
        url: "/configuration/saml",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [QueryKeys.Configurations],
    }),
    toggleSSOEnabled: builder.mutation<void, ToggleSSODto>({
      query: (body) => ({
        url: "/configuration/saml/enabled",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [QueryKeys.Configurations],
    }),
    testSSOConfiguration: builder.mutation<SSOTestResponseDto, void>({
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
  usePatchSSOConfigurationMutation,
  useToggleSSOEnabledMutation,
  useTestSSOConfigurationMutation,
} = ssoApi;
