import { ServiceEnum } from '../dto/project-event.dto';
import { Client } from './client';
import { Socket } from 'socket.io-client';


export interface MetricsClient {
    client: Client;
    subscriptions: ServiceEnum[];
}

export interface ProjectHandler {
    clients: MetricsClient[];
    websocket: Socket;
    subsciptions: Record<ServiceEnum, number>;
}
