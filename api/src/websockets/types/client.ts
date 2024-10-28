import { Socket } from 'socket.io';

export interface Client {
  userId: string;
  socket: Socket;
}
