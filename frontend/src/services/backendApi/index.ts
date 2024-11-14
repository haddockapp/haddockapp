import { RootState } from "@/app/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../authSlice";
import { constants } from "@/constants";

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
}

export const backendApi = createApi({
  reducerPath: "",
  baseQuery: async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    if (result.error?.status === 401) api.dispatch(logout());
    return result;
  },
  endpoints: () => ({}),
  tagTypes: [QueryKeys.Projects, QueryKeys.Domains],
});
