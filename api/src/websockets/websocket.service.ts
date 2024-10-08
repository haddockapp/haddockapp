import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Handler } from './types/handler';
import { MetricsHandler } from './handlers/metrics';
import { Client } from './types/client';
import { WebsocketEventDto } from './dto/websocket-event.dto';
import { ProjectEventDto } from './dto/project-event.dto';

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

  protectServiceSubscribe(client: Socket, eventData: ProjectEventDto) {
    if (!this.projects[eventData.projectId]) {
      this.projects[eventData.projectId] = new Project();
    }
    const project = this.projects[eventData.projectId];

    if (project) {
      const handler: Handler = project[eventData.service];

      if (handler) {
        handler.handleSubscribe(
          { userId: eventData.userId, socket: client },
          eventData.data,
        );
      }
    }
  }

  projectServiceUnsubscribe(client: Socket, eventData: ProjectEventDto) {
    if (!this.projects[eventData.projectId]) {
      this.projects[eventData.projectId] = new Project();
    }
    const project = this.projects[eventData.projectId];

    if (project) {
      const handler: Handler = project[eventData.service];

      if (handler) {
        handler.handleUnsubscribe(
          { userId: eventData.userId, socket: client },
          eventData.data,
        );
      }
    }
  }
}
