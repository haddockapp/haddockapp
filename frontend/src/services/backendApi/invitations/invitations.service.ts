import { backendApi, QueryKeys } from "..";
import { InviteUserDto } from "./invitations.dto";

const invitationsApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    inviteUser: builder.mutation<void, InviteUserDto>({
      query: (body) => ({
        url: "/invitations",
        method: "POST",
        body,
      }),
      invalidatesTags: [QueryKeys.Users],
    }),
    deleteInvitation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/invitations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [QueryKeys.Users],
    }),
  }),
});

export const { useInviteUserMutation, useDeleteInvitationMutation } =
  invitationsApi;
