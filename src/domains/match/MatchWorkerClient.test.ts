import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LogDomain, LoggerService } from '@core/services/logger/LoggerService';
import {
    MatchWorkerClient,
    type MatchWorkerMessage
} from './MatchWorkerClient';
import { useMatchLogStore } from './store/useMatchLogStore';
import { CommentaryService } from './services/CommentaryService';

class MockWorker extends EventTarget {
    public readonly url: string | URL;
    public readonly options?: WorkerOptions;
    public terminate = vi.fn();
    public postMessage = vi.fn();

    public constructor(url: string | URL, options?: WorkerOptions) {
        super();
        this.url = url;
        this.options = options;
        MockWorker.instances.push(this);
    }

    public emitMessage(data: MatchWorkerMessage): void {
        const event = new MessageEvent('message', { data });
        this.dispatchEvent(event);
    }

    public static instances: MockWorker[] = [];
}

describe('MatchWorkerClient', () => {
    let client: MatchWorkerClient;

    beforeEach(() => {
        MockWorker.instances = [];
        vi.stubGlobal('Worker', MockWorker);
        vi.spyOn(LoggerService.getInstance(), 'info').mockImplementation(() => {});
        vi.spyOn(LoggerService.getInstance(), 'debug').mockImplementation(() => {});
        vi.spyOn(LoggerService.getInstance(), 'warn').mockImplementation(() => {});
        
        client = MatchWorkerClient.createForTests();
        useMatchLogStore.getState().clearLogs();
    });

    const createValidState = (overrides: any = {}) => ({
        matchId: 'm1',
        seed: 1,
        minute: 0,
        second: 0,
        period: 1,
        score: { home: 0, away: 0 },
        homeStats: { goals: 0, shots: 0, shotsOnTarget: 0, xG: 0, possessionSeconds: 0 },
        awayStats: { goals: 0, shots: 0, shotsOnTarget: 0, xG: 0, possessionSeconds: 0 },
        homeRating: { shooting: 50, control: 50 },
        awayRating: { shooting: 50, control: 50 },
        possessionTeam: 'home',
        ballZone: 'MID_CENTER_L',
        currentPhase: 'KICK_OFF',
        isComplete: false,
        ...overrides
    });

    it('creates a module worker instance', () => {
        expect(MockWorker.instances).toHaveLength(1);
        expect(MockWorker.instances[0]?.options).toEqual({ type: 'module' });
    });

    it('sends an explicit start command before match simulation begins', () => {
        client.startMatch('HUB_MATCH_1', 7_202);

        expect(MockWorker.instances[0]?.postMessage).toHaveBeenCalledWith({
            type: 'start_match',
            matchId: 'HUB_MATCH_1',
            seed: 7_202
        });
    });

    it('logs heartbeat messages from the worker through LoggerService', () => {
        const worker = MockWorker.instances[0];

        worker?.emitMessage({
            type: 'heartbeat',
            timestamp: 1_000,
            sequence: 1
        });

        expect(LoggerService.getInstance().info).toHaveBeenCalledWith(
            'Match worker heartbeat received',
            { timestamp: 1_000, sequence: 1 },
            LogDomain.MATCH
        );
    });

    it('processes valid state updates and updates the log store', () => {
        const worker = MockWorker.instances[0];
        
        worker?.emitMessage({
            type: 'state_update',
            state: createValidState({ minute: 1, second: 30, currentPhase: 'OPEN_PLAY' })
        });

        expect(useMatchLogStore.getState().currentTime).toEqual({ min: 1, sec: 30 });
        expect(useMatchLogStore.getState().logs).toHaveLength(1);
    });

    it('pauses simulation on goal and resumes after 3 seconds', async () => {
        vi.useFakeTimers();
        const worker = MockWorker.instances[0];
        const postMessageSpy = vi.spyOn(worker!, 'postMessage');
        
        const baseState = createValidState({ minute: 10, currentPhase: 'OPEN_PLAY' });
        worker?.emitMessage({ type: 'state_update', state: baseState });

        const goalState = createValidState({ 
            minute: 10, 
            score: { home: 1, away: 0 }, 
            homeStats: { goals: 1, shots: 1, shotsOnTarget: 1, xG: 0.8, possessionSeconds: 300 } 
        });
        
        worker?.emitMessage({ type: 'state_update', state: goalState });

        expect(useMatchLogStore.getState().isPaused).toBe(true);
        expect(postMessageSpy).toHaveBeenCalledWith({ type: 'stop_match', clearState: false });

        vi.advanceTimersByTime(3001);
        
        expect(useMatchLogStore.getState().isPaused).toBe(false);
        expect(postMessageSpy).toHaveBeenCalledWith({ type: 'resume_match' });

        vi.useRealTimers();
    });

    it('handles half-time state by pausing and stopping worker', () => {
        const worker = MockWorker.instances[0];
        const postMessageSpy = vi.spyOn(worker!, 'postMessage');
        
        vi.spyOn(CommentaryService.getInstance(), 'generateLog').mockReturnValue([{
            id: '1', minute: 45, second: 0, text: 'MI-TEMPS', type: 'WHISTLE', intensity: 'MEDIUM'
        }]);

        worker?.emitMessage({
            type: 'state_update',
            state: createValidState({ minute: 45 })
        });

        expect(useMatchLogStore.getState().isHalfTime).toBe(true);
        expect(useMatchLogStore.getState().isPaused).toBe(true);
        expect(postMessageSpy).toHaveBeenCalledWith({ type: 'stop_match', clearState: false });
    });
});
