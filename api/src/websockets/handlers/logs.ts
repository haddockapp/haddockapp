import { CronJob } from 'cron';
import { Client } from '../types/client';
import { Handler } from '../types/handler';
import { promisify } from 'util';
import { exec } from 'child_process';
import { PersistedProjectDto } from 'src/project/dto/project.dto';
import { Logger } from '@nestjs/common';

const execPromise = promisify(exec);

export class LogsHandler implements Handler {
  clients: Client[] = [];
  job: CronJob<null, null>;
  project: PersistedProjectDto;
  private prevLogs: string[] = [];
  private readonly logger = new Logger(LogsHandler.name);

  constructor(project: PersistedProjectDto) {
    this.project = project;
    this.job = new CronJob('*/10 * * * * *', async () => {
      const logs: string[] = await this.getLogs();

      if (
        this.prevLogs.length === logs.length &&
        this.prevLogs.every((value, index) => value === logs[index])
      ) {
        return;
      }

      this.clients.forEach((c) => {
        c.socket.emit('logs', { logs });
      });
      this.prevLogs = logs;
    });
  }

  private async getLogsGithub(): Promise<string[]> {
    try {
      const { stdout } = await execPromise(
        `cd ${this.project.path} && vagrant ssh -c "cd ./service && docker-compose logs --tail 1000"`,
      );

      return stdout.split('\n').map((line) => line.trim());
    } catch (error) {
      this.logger.error(
        `Error fetching Logs usage for VM ${this.project.path}:`,
        error.message,
      );
      return [];
    }
  }

  private async getLogs(): Promise<string[]> {
    switch (this.project.source.type) {
      case 'github': {
        return this.getLogsGithub();
      }
      default: {
        throw new Error('Unsupported source type');
      }
    }
  }

  async handleSubscribe(client: Client, data: any): Promise<void> {
    if (this.clients.length === 0) {
      this.job.fireOnTick();
      this.job.start();
    }
    this.clients.push(client);
    client.socket.emit('message', 'subscribed to logs');
    client.socket.emit('logs', { logs: this.prevLogs });
  }

  async handleUnsubscribe(client: Client, data: any): Promise<void> {
    this.clients = this.clients.filter((c) => c.socket !== client.socket);
    if (this.clients.length === 0) {
      this.job.stop();
    }
    client.socket.emit('message', 'unsubscribed from logs');
  }
}
