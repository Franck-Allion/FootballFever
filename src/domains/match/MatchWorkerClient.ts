import { LogDomain, LoggerService } from '@core/services/logger/LoggerService';
import type { MatchWorkerMessage } from './worker/MatchWorker';

export type { MatchWorkerMessage };

export class MatchWorkerClient {
    private readonly worker: Worker;
    private readonly logger: LoggerService;

    private constructor(logger: LoggerService = LoggerService.getInstance()) {
        this.logger = logger;
        this.worker = new Worker(new URL('./worker/MatchWorker.ts', import.meta.url), {
            type: 'module'
        });
        this.worker.addEventListener('message', this.handleMessage);
        this.worker.addEventListener('error', this.handleError);
    }

    public static createForTests(logger?: LoggerService): MatchWorkerClient {
        return new MatchWorkerClient(logger);
    }

    public terminate(): void {
        this.worker.removeEventListener('message', this.handleMessage);
        this.worker.removeEventListener('error', this.handleError);
        this.worker.terminate();
    }

    private readonly handleMessage = (event: MessageEvent<MatchWorkerMessage>): void => {
        switch (event.data.type) {
            case 'heartbeat':
                this.logger.info(
                    'Match worker heartbeat received',
                    {
                        timestamp: event.data.timestamp,
                        sequence: event.data.sequence
                    },
                    LogDomain.MATCH
                );
                break;
            default:
                this.logger.warn(
                    'Match worker received unknown message type',
                    { data: event.data },
                    LogDomain.MATCH
                );
        }
    };

    private readonly handleError = (error: ErrorEvent): void => {
        this.logger.error(
            'Match worker error detected',
            {
                message: error.message,
                filename: error.filename,
                lineno: error.lineno
            },
            LogDomain.MATCH
        );
    };
}

let matchWorkerClient: MatchWorkerClient | undefined;

export function getMatchWorkerClient(): MatchWorkerClient {
    // @ts-expect-error - Private constructor access within same file is allowed in TS.
    matchWorkerClient ??= new MatchWorkerClient();
    return matchWorkerClient;
}

export function resetMatchWorkerClientForTests(): void {
    matchWorkerClient?.terminate();
    matchWorkerClient = undefined;
}
