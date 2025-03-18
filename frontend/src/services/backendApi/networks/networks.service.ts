import { backendApi, QueryKeys } from "..";
import {
  CreateNetworkConnectionDto,
  NetworkConnectionDto,
} from "./networks.dto";

const networksApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getNetworksConnection: builder.query<NetworkConnectionDto[], string>({
      query: (projectId) => ({
        url: `/network-connection/project/${projectId}`,
      }),
      providesTags: [{ type: QueryKeys.Redirections, id: "LIST" }],
    }),
    createNetworkConnection: builder.mutation<
      NetworkConnectionDto,
      CreateNetworkConnectionDto
    >({
      query: (body) => ({
        url: `/network-connection`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: QueryKeys.Redirections, id: "LIST" }],
    }),
    deleteNetworkConnection: builder.mutation<NetworkConnectionDto, string>({
      query: (id) => ({
        url: `/network-connection/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: QueryKeys.Redirections, id: "LIST" }],
    }),
  }),
});

export const {
  useCreateNetworkConnectionMutation,
  useDeleteNetworkConnectionMutation,
  useGetNetworksConnectionQuery,
} = networksApi;
