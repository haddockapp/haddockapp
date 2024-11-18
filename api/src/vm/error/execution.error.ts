export class ExecutionError implements Error {
    name = 'ExecutionError';
    message = 'Failed to execute command';
    stack: string | undefined;

    constructor(message?: string) {
        if (message) {
        this.message = message;
        }
    }
}
