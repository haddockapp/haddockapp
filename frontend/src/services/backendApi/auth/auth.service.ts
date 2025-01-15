import { AuthResponse, GithubOAuthDto, LoginDto, SignupDto } from ".";
import { backendApi } from "..";

const authApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    signUp: builder.mutation<AuthResponse, SignupDto>({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
      }),
    }),
    signIn: builder.mutation<AuthResponse, LoginDto>({
      query: (body) => ({
        url: "/auth/signin",
        method: "POST",
        body,
      }),
    }),
    loginGithub: builder.mutation<AuthResponse, GithubOAuthDto>({
      query: (body) => ({
        url: "/auth/github",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLoginGithubMutation, useSignUpMutation, useSignInMutation } =
  authApi;
