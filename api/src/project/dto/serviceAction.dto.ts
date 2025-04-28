export enum ServiceAction {
  START = 'start',
  STOP = 'stop',
  RESTART = 'restart',
}

export interface ServiceActionDto {
  service: string;
  action: ServiceAction;
}
