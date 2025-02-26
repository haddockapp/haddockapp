import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Handler } from './types/handler';
import { Client } from './types/client';
import { WebsocketEventDto } from './dto/websocket-event.dto';
import { ProjectEventDto } from './dto/project-event.dto';
import { ProjectHandlers } from './types/project-handlers';
import { ProjectRepository } from 'src/project/project.repository';
import { PersistedProjectDto } from 'src/project/dto/project.dto';

@Injectable()
export class WebSocketService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  private clients: { [key: string]: Client } = {};
  private projects: { [key: string]: ProjectHandlers } = {};

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

    Object.values(this.projects).forEach((project: ProjectHandlers) => {
      Object.values(project).forEach((handler: Handler) => {
        const clientRemove: Client = handler.clients.find(
          (c) => c.socket === client && c.userId === userId,
        );

        if (clientRemove) {
          handler.handleUnsubscribe(clientRemove, {});
        }
      });
    });
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

  async removeProject(projectId: string) {
    if (this.projects[projectId]) {
        const project = this.projects[projectId];
        Object.values(project).forEach((handler: Handler) => {
          handler.job.stop();
        });
      delete this.projects[projectId];
    }
  }

  async protectService(client: Socket, eventData: ProjectEventDto) {
    if (!this.projects[eventData.projectId]) {
      const project: PersistedProjectDto =
        await this.projectRepository.findProjectById(eventData.projectId);

      if (!project) {
        throw new Error('Project not found');
      }

      this.projects[eventData.projectId] = new ProjectHandlers(project);
    }
    const project = this.projects[eventData.projectId];

    const handler: Handler = project[eventData.service];

    if (handler) {
      if (eventData.subscribe) {
        handler.handleSubscribe(
          { userId: eventData.userId, socket: client },
          eventData.data,
        );
      } else {
        handler.handleUnsubscribe(
          { userId: eventData.userId, socket: client },
          eventData.data,
        );
      }
    }
  }
}
