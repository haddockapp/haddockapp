import { exec, ExecOptions } from 'child_process';
import { ExecutionError } from 'src/types/error/execution.error';

export interface ExecResult {
  stdout: string;
  stderr: string;
  error?: Error;
}

const execCommand = async (
  command: string,
  options?: ExecOptions,
): Promise<ExecResult> => {
  try {
    const promise = new Promise<ExecResult>((resolve, reject) => {
      exec(command, options, (error, stdout, stderr) => {
        if (error) {
          reject(new ExecutionError(stdout, stderr, error));
        }
        resolve({ stdout, stderr });
      });
    });

    return await promise;
  } catch (error) {
    if (error instanceof ExecutionError) {
      throw error;
    }
    throw new ExecutionError('', '', error as Error);
  }
};

export { execCommand };
