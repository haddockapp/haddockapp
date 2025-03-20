import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Client } from './types/client';
import { WebsocketEventDto } from './dto/websocket-event.dto';
import { ProjectEventDto, ServiceEnum } from './dto/project-event.dto';
import { MetricsClient, ProjectHandler } from './types/project-handler';
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
    this.logger.log(`Client ${userId} connected`);
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

    this.logger.log(`Client ${userId} disconnected`);
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

  async createProject(projectId: string) {
    if (!this.projects[projectId]) {
      await this.createProjectHandler(projectId);
      this.logger.log(`Project ${projectId} created`);
    }
  }

  removeProject(projectId: string) {
    if (this.projects[projectId]) {
      this.projects[projectId].clients.forEach((client) => {
        client.client.socket.disconnect();
      });

      this.projects[projectId].websocket.close();
      delete this.projects[projectId];
      this.logger.log(`Project ${projectId} removed`);
    }
  }

  async handleUnsubscribe(client: Socket, eventData: ProjectEventDto) {
    if (this.projects[eventData.projectId]) {
      const subscribed: MetricsClient = this.projects[
        eventData.projectId
      ].clients.find((c) => c.client.userId === eventData.userId);

      subscribed.subscriptions = subscribed.subscriptions.filter(
        (s) => !eventData.services.includes(s),
      );

      if (subscribed.subscriptions.length === 0) {
        this.removeClientFromProject(client, eventData.projectId);
        this.logger.log(
          `Client ${eventData.userId} unsubscribed from project ${eventData.projectId}`,
        );
      }
      this.logger.log(
        `Client ${eventData.userId} unsubscribed from services ${eventData.services} in project ${eventData.projectId}`,
      );
    }
  }

  async handleSubscribe(client: Socket, eventData: ProjectEventDto) {
    if (!this.projects[eventData.projectId]) {
      await this.createProjectHandler(eventData.projectId);
    }

    const clientAlreadySubscribed = this.projects[
      eventData.projectId
    ].clients.find((c) => c.client.userId === eventData.userId);

    if (clientAlreadySubscribed) {
      clientAlreadySubscribed.subscriptions = Array.from(
        new Set([
          ...clientAlreadySubscribed.subscriptions,
          ...eventData.services,
        ]),
      );
      this.logger.log(
        `Client ${eventData.userId} subscribed to project ${eventData.projectId} updated with services ${clientAlreadySubscribed.subscriptions}`,
      );
      return;
    }

    this.projects[eventData.projectId].clients.push({
      client: {
        userId: eventData.userId,
        socket: client,
      },
      subscriptions: eventData.services,
    });

    this.logger.log(
      `Client ${eventData.userId} subscribed to project ${eventData.projectId} with services ${eventData.services}`,
    );
  }

  private removeClientFromProject(client: Socket, projectId: string) {
    this.projects[projectId].clients = this.projects[projectId].clients.filter(
      (c) => c.client.socket !== client,
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
        if (!client.subscriptions) {
          return;
        }
        if (!client.subscriptions.includes(ServiceEnum.METRICS)) {
          return;
        }
        client.client.socket.emit('metrics', {
          data,
        });
      });
    });

    ws.on('logs', (data) => {
      this.projects[projectId].clients.forEach((client) => {
        if (!client.subscriptions) {
          return;
        }
        if (!client.subscriptions.includes(ServiceEnum.LOGS)) {
          return;
        }
        client.client.socket.emit('logs', {
          logs: data.split('\n'),
        });
      });
    });

    ws.on('status', (data) => {
      this.projects[projectId].clients.forEach((client) => {
        if (!client.subscriptions) {
          return;
        }
        if (!client.subscriptions.includes(ServiceEnum.STATUS)) {
          return;
        }
        client.client.socket.emit('status', {
          status: data,
        });
      });
    });
  }
}
