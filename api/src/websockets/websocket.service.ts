import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Handler } from './types/handler';
import { MetricsHandler } from './handlers/metrics';
import { Client } from './types/client';
import { WebsocketEventDto } from './dto/websocket-event.dto';

class Project {
  metrics: Handler;

  constructor() {
    this.metrics = new MetricsHandler();
  }
}

@Injectable()
export class WebSocketService {
  private clients: { [key: string]: Client } = {};
  private projects: { [key: string]: Project } = {};

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

  protectServiceSubscribe(
    client: Socket,
    userId: string,
    projectId: string,
    service: string,
    data: any,
  ) {
    if (!this.projects[projectId]) {
      this.projects[projectId] = new Project();
    }

    const project = this.projects[projectId];

    console.log('project', project);

    if (project) {
      const handler: Handler = project[service];

      if (handler) {
        handler.handleSubscribe({ userId, socket: client }, data);
      }
    }
  }

  projectServiceUnsubscribe(
    client: Socket,
    userId: string,
    projectId: string,
    service: string,
  ) {
    if (!this.projects[projectId]) {
      this.projects[projectId] = new Project();
    }

    const project = this.projects[projectId];

    if (project) {
      const handler: Handler = project[service];

      if (handler) {
        handler.handleUnsubscribe({ userId, socket: client }, {});
      }
    }
  }
}
