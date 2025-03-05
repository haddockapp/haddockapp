import { CronJob } from 'cron';
import { Client } from '../types/client';
import { Handler } from '../types/handler';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

export class LogsHandler implements Handler {
  clients: Client[] = [];
  job: CronJob<null, null>;
  path: string;

  constructor(path: string) {
    this.path = path;
    this.job = new CronJob('*/60 * * * * *', async () => {
      const logs: string[] = await this.getLogs(this.path);

      this.clients.forEach((c) => {
        c.socket.emit('logs', { logs });
      });
    });
  }

  private async getLogs(projectPath: string): Promise<string[]> {
    try {
      const { stdout } = await execPromise(
        `cd ${projectPath} && vagrant ssh -c "cd ./service && docker-compose logs"`,
      );

      return stdout.split('\n').map((line) => line.trim());
    } catch (error) {
      console.error(
        `Error fetching CPU usage for VM ${projectPath}:`,
        error.message,
      );
      throw error;
    }
  }

  async handleSubscribe(client: Client, data: any): Promise<void> {
    if (this.clients.length === 0) {
      this.job.start();
    }
    this.clients.push(client);
    client.socket.emit('message', 'subscribed to logs');
  }

  async handleUnsubscribe(client: Client, data: any): Promise<void> {
    this.clients = this.clients.filter((c) => c.userId !== client.userId);
    if (this.clients.length === 0) {
      this.job.stop();
    }
    client.socket.emit('message', 'unsubscribed from logs');
  }
}
