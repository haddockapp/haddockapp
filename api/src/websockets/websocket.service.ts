import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Client } from './types/client';
import { WebsocketEventDto } from './dto/websocket-event.dto';
import { ProjectEventDto } from './dto/project-event.dto';
import { ProjectHandler } from './types/project-handler';
import { ProjectRepository } from 'src/project/project.repository';
import { PersistedProjectDto } from 'src/project/dto/project.dto';
import { io } from 'socket.io-client';

@Injectable()
export class WebSocketService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  private clients: { [key: string]: Client } = {};
  private projects: { [key: string]: ProjectHandler } = {};
  private readonly logger = new Logger(WebSocketService.name);

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

    Object.keys(this.projects).forEach((projectId) => {
      this.removeClientFromProject(client, projectId);
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

  removeProject(projectId: string) {
    if (this.projects[projectId]) {
        this.projects[projectId].clients.forEach((client) => {
            client.socket.disconnect();
        });

        this.projects[projectId].websocket.close();
        delete this.projects[projectId];
        this.logger.log(`Project ${projectId} removed`);
    }
  }

  removeClientFromProject(client: Socket, projectId: string) {
    if (this.projects[projectId]) {
      this.projects[projectId].clients = this.projects[
        projectId
      ].clients.filter((c) => c.socket !== client);
    }
  }

  async handleUnscribe(client: Socket, eventData: ProjectEventDto) {
    this.removeClientFromProject(client, eventData.projectId);
    this.logger.log(
      `Client ${eventData.userId} unsubscribed from project ${eventData.projectId}`,
    );
  }

  async handleSubscribe(client: Socket, eventData: ProjectEventDto) {
    if (!this.projects[eventData.projectId]) {
      await this.createProjectHandler(eventData.projectId);
    }

    if (
      this.projects[eventData.projectId].clients.some(
        (c) => c.socket === client,
      )
    ) {
      this.logger.log(
        `Client ${eventData.userId} already subscribed to project ${eventData.projectId}`,
      );
      return;
    }

    this.projects[eventData.projectId].clients.push({
      userId: eventData.userId,
      socket: client,
    });

    this.logger.log(
      `Client ${eventData.userId} subscribed to project ${eventData.projectId}`,
    );
  }

  private async createProjectHandler(projectId: string) {
    this.logger.log(`Creating project handler for project ${projectId}`);

    const project: PersistedProjectDto =
      await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    this.projects[projectId] = {
      clients: [],
      websocket: io(`ws://${project.vm.ip}:55000`, { reconnection: false }),
    };

    const ws = this.projects[projectId].websocket;

    ws.on('connect', () => {
      ws.emit('subscribe', ['metrics', 'logs', 'status']);
    });

    ws.on('disconnect', () => {
      this.logger.error(`Websocket connection closed for project ${projectId}`);
      this.removeProject(projectId);
    });

    ws.on('connect_error', (err) => {
      this.logger.error(`Connection error for project ${projectId}:`, err);
      this.removeProject(projectId);
    });

    ws.on('error', (err) => {
      this.logger.error(`Error for project ${projectId}:`, err);
    });

    ws.on('metrics', (data) => {
        this.projects[projectId].clients.forEach((client) => {
            client.socket.emit('metrics', {
                cpuUsage: data.cpu_usage.percent,
                memoryUsage: data.memory_usage.percent,
                diskUsage: data.disk_usage.percent,
            });
        });
    });

    ws.on('logs', (data) => {
        this.projects[projectId].clients.forEach((client) => {
            client.socket.emit('logs', {
                logs: data.split('\n'),
            });
        });
    });

    ws.on('status', (data) => {
    });
  }
}
