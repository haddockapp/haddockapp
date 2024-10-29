import { backendApi } from "..";
import {
  CreateNetworkConnectionDto,
  NetworkConnectionDto,
} from "./networks.dto";

const networksApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getNetworksConnection: builder.query<NetworkConnectionDto[], string>({
      query: (projectId) => ({
        url: `network-connection/project/${projectId}`,
      }),
    }),
    createNetworkConnection: builder.mutation<
      NetworkConnectionDto,
      CreateNetworkConnectionDto
    >({
      query: (body) => ({
        url: `network-connection`,
        method: "POST",
        body,
      }),
    }),
    deleteNetworkConnection: builder.mutation<NetworkConnectionDto, string>({
      query: (id) => ({
        url: `network-connection/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateNetworkConnectionMutation,
  useDeleteNetworkConnectionMutation,
  useGetNetworksConnectionQuery,
} = networksApi;
