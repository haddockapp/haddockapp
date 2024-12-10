import { backendApi } from "..";
import { Authorization, AuthorizationCreateDto } from "./authorizations.dto";

const authorizationApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({ 
        getAllAuthorizations: builder.query<Authorization[], void>({
            query: () => ({
                url: '/authorization',
                method: 'GET'
            })
        }),
        createAuthorization: builder.mutation<Authorization, AuthorizationCreateDto>({
            query: (body) => ({
                url: '/authorization',
                method: 'POST',
                body
            })
        }),
        deleteAuthorization: builder.mutation<void, string>({
            query: (id) => ({
                url: `/authorization/${id}`,
                method: 'DELETE'
            })
        })
    })
})

export const {
    useGetAllAuthorizationsQuery,
    useCreateAuthorizationMutation,
    useDeleteAuthorizationMutation
} = authorizationApi