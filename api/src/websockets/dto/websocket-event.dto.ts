export enum EventScope {
  PROJECT = 'project',
  SERVICE = 'service',
}

export enum EventType {
  STATUS_CHANGE = 'status_change',
}

export interface WebsocketEventDto {
  scope: EventScope;
  event: EventType;
  target?: string;
  data: any;
}
