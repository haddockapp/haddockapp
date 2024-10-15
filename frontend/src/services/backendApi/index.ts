import { RootState } from "@/app/store";
import { constants } from "@/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: constants.apiUrl,
  timeout: 5000,
  prepareHeaders: (headers, { getState }) => {
    const { token } = (getState() as RootState).auth;

    if (token) headers.set("Authorization", `Bearer ${token}`);

    return headers;
  },
});

export const backendApi = createApi({
  reducerPath: "",
  baseQuery,
  endpoints: () => ({}),
  tagTypes: ["Projects"],
});
