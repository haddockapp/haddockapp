import { ProjectHandlers } from '../types/project-handlers';

export type services = keyof ProjectHandlers;

export interface ProjectEventDto {
  userId: string;
  projectId: string;
  service: services;
  subscribe: boolean;
  data: any;
}
