import { CronJob } from 'cron';
import { Client } from '../types/client';
import { Handler } from '../types/handler';
import { promisify } from 'util';
import { exec } from 'child_process';
import { PersistedProjectDto } from 'src/project/dto/project.dto';
import { Logger } from '@nestjs/common';

const execPromise = promisify(exec);

export class MetricsHandler implements Handler {
  clients: Client[] = [];
  job: CronJob<null, null>;
  project: PersistedProjectDto;
  private prevCpuUsage: number = 0;
  private prevMemoryUsage: number = 0;
  private readonly logger = new Logger(MetricsHandler.name);

  constructor(project: PersistedProjectDto) {
    this.project = project;
    this.job = new CronJob('*/10 * * * * *', async () => {
      const cpuUsage = await this.getCpuUsage();
      const memoryUsage = await this.getMemoryUsage();

      if (
        this.prevCpuUsage === cpuUsage &&
        this.prevMemoryUsage === memoryUsage
      ) {
        return;
      }

      this.clients.forEach((c) => {
        c.socket.emit('metrics', { cpuUsage, memoryUsage });
      });
      this.prevCpuUsage = cpuUsage;
      this.prevMemoryUsage = memoryUsage;
    });
  }

  private async getCpuUsageLinux(): Promise<number> {
    try {
      const { stdout } = await execPromise(
        `cd ${this.project.path} && vagrant ssh -c "echo \\$[100-\\$(vmstat 1 2|tail -1|awk '{print \\$15}')]"`,
      );

      return parseInt(stdout.trim(), 10);
    } catch (error) {
      this.logger.error(
        `Error fetching CPU usage for VM ${this.project.path}:`,
        error.message,
      );
    }
  }

  private async getCpuUsage(): Promise<number> {
    switch (this.project.vm.provider) {
      case 'libvirt': {
        return this.getCpuUsageLinux();
      }
      default:
        throw new Error('Unsupported VM provider');
    }
  }

  private async getMemoryUsageLinux(): Promise<number> {
    try {
      const { stdout } = await execPromise(
        `cd ${this.project.path} && vagrant ssh -c "free | grep Mem | awk '{print \\$3/\\$2 * 100.0}'"`,
      );

      return parseInt(stdout.trim(), 10);
    } catch (error) {
      this.logger.error(
        `Error fetching memory usage for VM ${this.project.path}:`,
        error.message,
      );
    }
  }

  private async getMemoryUsage(): Promise<number> {
    switch (this.project.vm.provider) {
      case 'libvirt': {
        return this.getMemoryUsageLinux();
      }
      default:
        throw new Error('Unsupported VM provider');
    }
  }

  async handleSubscribe(client: Client, data: any): Promise<void> {
    if (this.clients.length === 0) {
      this.job.fireOnTick();
      this.job.start();
    }
    this.clients.push(client);
    client.socket.emit('message', 'subscribed to metrics');
    client.socket.emit('metrics', {
      cpuUsage: this.prevCpuUsage,
      memoryUsage: this.prevMemoryUsage,
    });
  }

  async handleUnsubscribe(client: Client, data: any): Promise<void> {
    this.clients = this.clients.filter((c) => c.userId !== client.userId);
    if (this.clients.length === 0) {
      this.job.stop();
    }
    client.socket.emit('message', 'unsubscribed from metrics');
  }
}
