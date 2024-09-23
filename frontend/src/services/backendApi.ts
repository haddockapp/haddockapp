import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const backendApi = createApi({
  reducerPath: "",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: () => ({}),
});

// eslint-disable-next-line no-empty-pattern
export const {} = backendApi;
