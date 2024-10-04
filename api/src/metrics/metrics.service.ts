import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

@Injectable()
export class MetricsService {
  async getCpuUsage(projectPath: string): Promise<number> {
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

  async getMemoryUsage(projectPath: string): Promise<number> {
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
}
