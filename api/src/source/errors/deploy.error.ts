export class DeployError implements Error {
  name = 'DeployError';
  message = 'Failed to deploy source';
  stack: string | undefined;
  logs: string[] = [];

  constructor(message?: string, logs?: string[]) {
    if (message) {
      this.message = message;
    }
    if (logs) {
      this.logs = logs;
    }
  }
}
