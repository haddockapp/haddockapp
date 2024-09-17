import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WebsocketEventDto } from './dto/websocket-event.dto';

interface Client {
  userId: string;
  socket: Socket;
}

@Injectable()
export class WebSocketService {
  private clients: { [key: string]: Client } = {};

  addClient(userId: string, client: Socket) {
    this.clients[userId] = {
      userId,
      socket: client,
    };
  }

  removeClient(client: Socket) {
    const userId = Object.keys(this.clients).find(
      (key) => this.clients[key].socket === client,
    );
    if (userId) {
      delete this.clients[userId];
    }
  }

  notifyUser(userId: string, message: object) {
    const client = this.clients[userId];
    if (client) {
      client.socket.emit('message', message);
    }
  }

  notifyAll(message: WebsocketEventDto) {
    Object.values(this.clients).forEach((client) => {
      client.socket.emit('message', message);
    });
  }

  getClient(userId: string): Client | undefined {
    return this.clients[userId];
  }
}
