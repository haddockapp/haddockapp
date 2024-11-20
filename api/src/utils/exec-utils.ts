import { exec, ExecOptions } from 'child_process';
import { ExecutionError } from 'src/types/error/execution.error';

const execCommand = async (
  command: string,
  options?: ExecOptions,
): Promise<string> => {
  try {
    const promise = new Promise<string>((resolve, reject) => {
      exec(command, options, (error, stdout) => {
        if (error) {
          reject(new ExecutionError(`Command failed: ${error.message}`));
        }
        resolve(stdout);
      });
    });

    return await promise;
  } catch (error) {
    throw new ExecutionError(
      `Execution of command "${command}" failed: ${error.message}`,
    );
  }
};

export { execCommand };
