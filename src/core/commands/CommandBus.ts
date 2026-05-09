export interface Command<T = any> {
    type: string;
    payload?: T;
}

export type CommandHandler<T = any> = (command: Command<T>) => Promise<void> | void;

export class CommandBus {
    private static instance: CommandBus | null = null;
    private handlers: Map<string, CommandHandler> = new Map();

    private constructor() {}

    public static getInstance(): CommandBus {
        if (!CommandBus.instance) {
            CommandBus.instance = new CommandBus();
        }
        return CommandBus.instance;
    }

    public register(type: string, handler: CommandHandler): void {
        this.handlers.set(type, handler);
    }

    public async dispatch<T>(command: Command<T>): Promise<void> {
        const handler = this.handlers.get(command.type);
        if (!handler) {
            console.error(`CommandBus: No handler registered for command type: ${command.type}`);
            return;
        }

        try {
            await handler(command);
        } catch (error) {
            console.error(`CommandBus: Error executing command ${command.type}:`, error);
            throw error;
        }
    }
}
