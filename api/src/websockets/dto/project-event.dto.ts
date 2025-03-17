enum ServiceEnum {
    METRICS = 'metrics',
    LOGS = 'logs',
    STATUS = 'status'
}

export interface ProjectEventDto {
  userId: string;
  projectId: string;
  service: ServiceEnum;
  subscribe: boolean;
  data: any;
}
