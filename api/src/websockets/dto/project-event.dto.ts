export interface ProjectEventDto {
  userId: string;
  projectId: string;
  service: string;
  subscribe: boolean;
  data: any;
}
