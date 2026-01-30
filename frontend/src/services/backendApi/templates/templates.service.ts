import { backendApi, QueryKeys } from "@/services/backendApi";
import { TemplateResponse } from "./templates.dto";

const templatesApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<TemplateResponse[], void>({
      query: () => ({ url: "/templates" }),
      providesTags: [QueryKeys.Templates],
    }),
  }),
});

export const { useGetTemplatesQuery, useLazyGetTemplatesQuery } = templatesApi;

export default templatesApi;
