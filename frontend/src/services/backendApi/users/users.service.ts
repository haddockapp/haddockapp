import { backendApi } from "..";
import { UserResponseDto } from ".";

const usersApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getSelf: builder.query<UserResponseDto, void>({
      query: () => ({
        url: "/users/me",
      }),
    }),
  }),
});

export const { useGetSelfQuery } = usersApi;
