import { ServiceState } from "@/types/services/services";
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
}

export interface ServiceStatusDetails {
  State: string;
  Command: string;
  Created: number;
  ExitCode: number;
  Health: string;
  ID: string;
  Image: string;
  Name: string;
  Project: string;
  Service: string;
  Status: string;
}

export interface ServiceDto extends ServiceInformationDto {
  id: string;
  icon: string;
  status: ServiceState;
  statusTimeStamp: Date;
  // statusDetails is injected by the websocket
  statusDetails?: ServiceStatusDetails;
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
      { projectId: string; serviceId: string }
    >({
      query: ({ projectId, serviceId }) => ({
        url: `/project/${projectId}/service/${serviceId}`,
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
