import { backendApi, QueryKeys } from "@/services/backendApi";
import { UpdateUserPasswordDto, UserDto } from "./users.dto";

const usersApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getSelf: builder.query<UserDto, void>({
      query: () => ({
        url: "/users/me",
      }),
      providesTags: [QueryKeys.Users],
    }),
    getAllUsers: builder.query<[], void>({
      query: () => ({
        url: "/users",
      }),
      providesTags: [QueryKeys.Users],
    }),
    changeUserPassword: builder.mutation<
      void,
      { id: string } & UpdateUserPasswordDto
    >({
      query: ({ id, ...body }) => ({
        url: `/users/${id}/password`,
        method: "PUT",
        body,
      }),
    }),
    activateUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}/activate`,
        method: "PUT",
      }),
      invalidatesTags: [QueryKeys.Users],
    }),
    disableUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}/disable`,
        method: "PUT",
      }),
      invalidatesTags: [QueryKeys.Users],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [QueryKeys.Users],
    }),
    downloadUserData: builder.query<Buffer, string>({
      query: (id) => ({
        url: `/users/${id}/data`,
      }),
    }),
  }),
});

export const {
  useGetSelfQuery,
  useGetAllUsersQuery,
  useChangeUserPasswordMutation,
  useActivateUserMutation,
  useDisableUserMutation,
  useDeleteUserMutation,
  useLazyDownloadUserDataQuery,
} = usersApi;
