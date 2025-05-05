import { backendApi, QueryKeys } from ".";

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
  environment: Record<string, any>;
  user: ServiceUser | null;
  deployment: ServiceDeployment | null;
  status?: any;
}

export interface ServiceDto extends ServiceInformationDto {
  icon: string;
}

const servicesApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getServicesByProjectId: builder.query<ServiceDto[], string>({
      query: (projectId) => ({
        url: `/project/${projectId}/service`,
        method: "GET",
      }),
      providesTags: [QueryKeys.Projects],
    }),
    getServiceInformations: builder.query<
      ServiceInformationDto,
      { projectId: string; serviceName: string }
    >({
      query: ({ projectId, serviceName }) => ({
        url: `/project/${projectId}/service/${serviceName}`,
        method: "GET",
      }),
      providesTags: [QueryKeys.Projects],
    }),
  }),
});

export const {
  useGetServicesByProjectIdQuery,
  useGetServiceInformationsQuery,
} = servicesApi;
