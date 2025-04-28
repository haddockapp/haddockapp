export enum ServiceEnum {
    METRICS = 'metrics',
    LOGS = 'logs',
    STATUS = 'status'
}

export interface ProjectEventDto {
  userId: string;
  projectId: string;
  services: ServiceEnum[];
  subscribe: boolean;
}
