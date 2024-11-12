import { RootState } from "@/app/store";
import { constants } from "@/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: constants.apiUrl,
  timeout: 5000,
  prepareHeaders: (headers, { getState }) => {
    const { token } = (getState() as RootState).auth;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export enum QueryKeys {
  Projects = "Projects",
  Domains = "Domains",
  Redirections = "Redirections",
}

export const backendApi = createApi({
  reducerPath: "",
  baseQuery: async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    if (result.error?.status === 401) api.dispatch(logout());
    return result;
  },
  endpoints: () => ({}),
  tagTypes: [QueryKeys.Projects, QueryKeys.Domains, QueryKeys.Redirections],
});
