export interface NetworkConnectionDto {
  id: string;
  domain: string;
  port: number;
  createdAt: Date;
  projectId: string;
}

export interface CreateNetworkConnectionDto {
  domain: string;
  port: number;
  projectId: string;
}
