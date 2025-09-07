export interface NetworkConnectionDto {
  id: string;
  domain: string;
  port: number;
  createdAt: Date;
  projectId: string;
}

export interface CreateNetworkConnectionDto {
  domainId: string;
  prefix: string;
  port: number;
  projectId: string;
}
