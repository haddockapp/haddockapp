import { backendApi, QueryKeys } from "..";
import {
  ConfigurationPayloadDto,
  ConfigurationResponseDto,
} from "./configuration.dto";

const configurationApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getConfiguration: builder.query<ConfigurationResponseDto, void>({
      query: () => ({
        url: "/configuration",
        method: "GET",
      }),
      providesTags: [QueryKeys.Configurations],
    }),
    createConfiguration: builder.mutation<void, ConfigurationPayloadDto>({
      query: (body) => ({
        url: "/configuration/github",
        method: "POST",
        body,
      }),
      invalidatesTags: [QueryKeys.Configurations],
    }),
  }),
});

export const { useGetConfigurationQuery, useCreateConfigurationMutation } =
  configurationApi;
