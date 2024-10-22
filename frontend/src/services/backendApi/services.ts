import { backendApi } from ".";

export interface ServiceDto {
  name: string;
  image: string;
  icon: string;
  ports: string[];
}

export interface ServiceUser {
  uid: string;
  gid: string;
}

export interface ServiceDeployment {
  cpus: number;
  memory: number;
}

export interface ServiceInformationDto {
  name: string;
  image: string;
  ports: string[];
  networks: string[];
  depends_on: string[];
  environment: string[];
  user: ServiceUser | null;
  deployment: ServiceDeployment | null;
}

const servicesApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getServicesByProjectId: builder.query<ServiceDto[], string>({
      query: (projectId) => ({
        url: `/project/${projectId}/service`,
        method: "GET",
      }),
    }),
    getServiceInformations: builder.query<
      ServiceInformationDto,
      { projectId: string; serviceName: string }
    >({
      query: ({ projectId, serviceName }) => ({
        url: `/project/${projectId}/service/${serviceName}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetServicesByProjectIdQuery,
  useGetServiceInformationsQuery,
} = servicesApi;
