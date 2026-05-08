import { LogDomain, LoggerService } from '@core/services/logger/LoggerService';
import { MatchState, MatchStateSchema } from './logic/MatchState';
import type { MatchWorkerCommand, MatchWorkerMessage } from './worker/MatchWorker';
import { useMatchLogStore } from './store/useMatchLogStore';
import { CommentaryService } from './services/CommentaryService';

export type { MatchWorkerMessage };

export class MatchWorkerClient {
    private readonly worker: Worker;
    private readonly logger: LoggerService;
    private lastState: MatchState | undefined;

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

    public startMatch(matchId: string, seed: number): void {
        this.lastState = undefined;
        CommentaryService.getInstance().reset();
        const logStore = useMatchLogStore.getState();
        logStore.clearLogs();
        logStore.setMatchMetadata(matchId, seed);
        
        this.worker.postMessage({
            type: 'start_match',
            matchId,
            seed
        } satisfies MatchWorkerCommand);
    }

    public resumeMatch(): void {
        const logStore = useMatchLogStore.getState();
        logStore.setPaused(false);
        logStore.setHalfTime(false);
        
        this.worker.postMessage({
            type: 'resume_match'
        } satisfies MatchWorkerCommand);
    }

    public stopMatch(clearState = true): void {
        this.worker.postMessage({
            type: 'stop_match',
            clearState
        } satisfies MatchWorkerCommand);
    }

    private lastUpdateTimestamp = 0;
    private readonly THROTTLE_MS = 250; // Max 4 updates/sec for UI

    private readonly handleMessage = (event: MessageEvent<MatchWorkerMessage>): void => {
        switch (event.data.type) {
            case 'heartbeat':
                this.logger.info(
                    'Match worker heartbeat received',
                    { timestamp: event.data.timestamp, sequence: event.data.sequence },
                    LogDomain.MATCH
                );
                break;
            case 'state_update':
                {
                const parsedState = MatchStateSchema.safeParse(event.data.state);

                if (!parsedState.success) {
                    this.logger.warn(
                        'Match worker received invalid state update',
                        { issues: parsedState.error.issues },
                        LogDomain.MATCH
                    );
                    break;
                }

                const state = parsedState.data;
                const logStore = useMatchLogStore.getState();

                // Generate commentary logs
                const logs = CommentaryService.getInstance().generateLog(state, this.lastState);
                
                // CRITICAL: We update the store for logs IMMEDIATELY to not miss events,
                // but we throttle the time/score updates or use a batch approach if possible.
                // However, Zustand updates are fast enough if we don't over-render.
                
                if (logs.length > 0) {
                    logs.forEach(log => logStore.addLog(log));

                    const isGoal = logs.some(l => l.type === 'GOAL');
                    const isHalfTime = logs.some(l => l.text.includes('MI-TEMPS'));
                    const isFinished = state.isComplete;

                    if (isHalfTime) {
                        logStore.setHalfTime(true);
                        logStore.setPaused(true);
                        this.stopMatch(false); // Stop loop, keep state
                    } else if (isFinished) {
                        logStore.setFinished(true);
                        logStore.setPaused(true);
                        // Engine stops itself on isComplete
                    } else if (isGoal) {
                        // Pause for goal celebration/reading
                        logStore.setPaused(true);
                        this.stopMatch(false);
                        setTimeout(() => {
                            if (!useMatchLogStore.getState().isPaused) return; 
                            this.resumeMatch();
                        }, 3000);
                    }
                }

                // Throttled UI updates for clock/score/stamina
                const now = Date.now();
                if (now - this.lastUpdateTimestamp >= this.THROTTLE_MS || logs.length > 0 || state.isComplete) {
                    logStore.setCurrentTime(state.minute, state.second);
                    logStore.setScores(state.score.home, state.score.away);
                    logStore.setFinalStamina(state.homeRating.stamina, state.awayRating.stamina);
                    this.lastUpdateTimestamp = now;
                }

                this.lastState = state;
                break;
                }
                default:

                this.logger.warn(
                    'Match worker received unknown message type',
                    event.data,
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
