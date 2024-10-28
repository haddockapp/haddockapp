import { CronJob } from 'cron';
import { Client } from '../types/client';
import { Handler } from '../types/handler';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

export class MetricsHandler implements Handler {
  clients: Client[] = [];
  job: CronJob<null, null>;
  path: string;

  constructor(path: string) {
    this.path = path;
    this.job = new CronJob('*/60 * * * * *', async () => {
      const cpuUsage = await this.getCpuUsage(this.path);
      const memoryUsage = await this.getMemoryUsage(this.path);

      this.clients.forEach((c) => {
        c.socket.emit('metrics', { cpuUsage, memoryUsage });
      });
    });
  }

  private async getCpuUsage(projectPath: string): Promise<number> {
    try {
      const { stdout } = await execPromise(
        `cd ${projectPath} && vagrant ssh -c "echo \\$[100-\\$(vmstat 1 2|tail -1|awk '{print \\$15}')]"`,
      );

      return parseInt(stdout.trim(), 10);
    } catch (error) {
      console.error(
        `Error fetching CPU usage for VM ${projectPath}:`,
        error.message,
      );
      throw error;
    }
  }

  private async getMemoryUsage(projectPath: string): Promise<number> {
    try {
      const { stdout } = await execPromise(
        `cd ${projectPath} && vagrant ssh -c "free | grep Mem | awk '{print \\$3/\\$2 * 100.0}'"`,
      );

      return parseInt(stdout.trim(), 10);
    } catch (error) {
      console.error(
        `Error fetching memory usage for VM ${projectPath}:`,
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
    client.socket.emit('message', 'subscribed to metrics');
  }

  async handleUnsubscribe(client: Client, data: any): Promise<void> {
    this.clients = this.clients.filter((c) => c.userId !== client.userId);
    if (this.clients.length === 0) {
      this.job.stop();
    }
    client.socket.emit('message', 'unsubscribed from metrics');
  }
}
