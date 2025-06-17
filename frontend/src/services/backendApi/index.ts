import { RootState } from "@/app/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../authSlice";

const baseQuery = fetchBaseQuery({
  timeout: 60_000,
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
  Configurations = "Configurations",
  Authorizations = "Authorizations",
  Users = "Users",
  EnvironmentVariables = "EnvironmentVariables",
}

export const backendApi = createApi({
  reducerPath: "",
  baseQuery: async (args, api, extraOptions) => {
    const baseUrl = (api.getState() as RootState).config.backendUrl;
    const result = await baseQuery(
      { ...args, url: `${baseUrl}${args.url}` },
      api,
      extraOptions
    );
    if (result.error?.status === "FETCH_ERROR") api.dispatch(logout());
    if (result.error?.status === 401) api.dispatch(logout());
    return result;
  },
  endpoints: () => ({}),
  tagTypes: Object.values(QueryKeys),
});
