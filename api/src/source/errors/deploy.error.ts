export class DeployError implements Error {
  name = 'DeployError';
  message = 'Failed to deploy source';
  stack: string | undefined;

  constructor(message?: string) {
    if (message) {
      this.message = message;
    }
  }
}
