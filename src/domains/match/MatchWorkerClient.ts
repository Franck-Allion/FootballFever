import { LogDomain, LoggerService } from '@core/services/logger/LoggerService';
import type { MatchWorkerMessage } from './worker/MatchWorker';

export type { MatchWorkerMessage };

export class MatchWorkerClient {
    private readonly worker: Worker;
    private readonly logger: LoggerService;

    public constructor(logger: LoggerService = LoggerService.getInstance()) {
        this.logger = logger;
        this.worker = new Worker(new URL('./worker/MatchWorker.ts', import.meta.url), {
            type: 'module'
        });
        this.worker.addEventListener('message', this.handleMessage);
    }

    public terminate(): void {
        this.worker.removeEventListener('message', this.handleMessage);
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
        }
    };
}

let matchWorkerClient: MatchWorkerClient | undefined;

export function getMatchWorkerClient(): MatchWorkerClient {
    matchWorkerClient ??= new MatchWorkerClient();
    return matchWorkerClient;
}

export function resetMatchWorkerClientForTests(): void {
    matchWorkerClient?.terminate();
    matchWorkerClient = undefined;
}
