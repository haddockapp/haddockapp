import { AuthResponse, GithubOAuthDto } from ".";
import { backendApi } from ".."; 

const authApi  = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        loginGithub: builder.mutation<AuthResponse, GithubOAuthDto>({
            query: (body) => ({
                url: "/auth/github",
                method: "POST",
                body
            }),
        })
    })
})

export const { useLoginGithubMutation } = authApi;