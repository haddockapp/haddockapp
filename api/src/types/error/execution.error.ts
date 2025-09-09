export class ExecutionError implements Error {
  name = 'ExecutionError';
  message = 'Failed to execute command';
  stack: string | undefined;
  stdout: string;
  stderr: string;
  error?: Error;

  constructor(stdout: string, stderr: string, error?: Error) {
    this.stdout = stdout;
    this.stderr = stderr;
    this.error = error;
  }
}
