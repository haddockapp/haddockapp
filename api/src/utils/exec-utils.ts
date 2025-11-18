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
        const outStr = stdout?.toString() ?? '';
        const errStr = stderr?.toString() ?? '';

        if (error) {
          reject(new ExecutionError(outStr, errStr, error));
        }
        resolve({ stdout: outStr, stderr: errStr });
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
