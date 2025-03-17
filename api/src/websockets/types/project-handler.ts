import { Client } from './client';
import { Socket } from 'socket.io-client';


export interface ProjectHandler {
    clients: Client[];
    websocket: Socket;
}
