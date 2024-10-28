import { backendApi } from ".";

export interface ServiceDto {
  name: string;
  image: string;
  icon: string;
  ports: string[];
}

const servicesApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getServicesByProjectId: builder.query<ServiceDto[], string>({
      query: (projectId) => ({
        url: `/project/${projectId}/service`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetServicesByProjectIdQuery } = servicesApi;
