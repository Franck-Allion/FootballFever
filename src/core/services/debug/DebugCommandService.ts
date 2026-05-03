import { useEconomyStore } from '../../store/useEconomyStore';
import { useDebugStore } from '../../store/useDebugStore';
import { LoggerService, LogDomain } from '../logger/LoggerService';

export class DebugCommandService {
    private static instance: DebugCommandService;
    private logger = LoggerService.getInstance();

    private constructor() {}

    public static getInstance(): DebugCommandService {
        if (!DebugCommandService.instance) {
            DebugCommandService.instance = new DebugCommandService();
        }
        return DebugCommandService.instance;
    }

    public execute(commandLine: string): void {
        const trimmed = commandLine.trim();
        if (!trimmed.startsWith('/')) {
            this.logger.warn(`Invalid command format: ${trimmed}`, undefined, LogDomain.CORE);
            return;
        }

        const [command, ...args] = trimmed.substring(1).split(' ');
        
        this.logger.info(`Executing debug command: ${command}`, { args }, LogDomain.CORE);

        switch (command.toLowerCase()) {
            case 'add_prestige':
                this.handleAddPrestige(args);
                break;
            case 'clear_logs':
                this.handleClearLogs();
                break;
            default:
                this.logger.error(`Unknown command: ${command}`, undefined, LogDomain.CORE);
        }
    }

    private handleAddPrestige(args: string[]): void {
        const value = parseInt(args[0], 10);
        if (isNaN(value)) {
            this.logger.error('Usage: /add_prestige [number]', { provided: args[0] }, LogDomain.CORE);
            return;
        }

        useEconomyStore.getState().addPrestige(value);
        this.logger.info(`Added ${value} prestige via debug console`, { newTotal: useEconomyStore.getState().prestige }, LogDomain.CORE);
    }

    private handleClearLogs(): void {
        useDebugStore.getState().clearLogs();
        this.logger.info('Console logs cleared', undefined, LogDomain.CORE);
    }
}
