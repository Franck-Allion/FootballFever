import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchStateSchema } from '../logic/MatchState';

describe('MatchWorker', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.useFakeTimers();
        vi.stubGlobal('postMessage', vi.fn());
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('posts a heartbeat message every 1,000ms', async () => {
        await import('./MatchWorker');

        vi.advanceTimersByTime(1_000);
        expect(postMessage).toHaveBeenCalledWith({
            type: 'heartbeat',
            timestamp: expect.any(Number),
            sequence: 1
        });

        vi.advanceTimersByTime(1_000);
        expect(postMessage).toHaveBeenCalledWith({
            type: 'heartbeat',
            timestamp: expect.any(Number),
            sequence: 2
        });
    });

    it('posts state update messages every 250ms', async () => {
        await import('./MatchWorker');

        vi.advanceTimersByTime(250);
        const stateUpdateCall = vi.mocked(postMessage).mock.calls.find(([message]) => {
            return typeof message === 'object' && message !== null && Reflect.get(message, 'type') === 'state_update';
        });

        expect(stateUpdateCall).toBeDefined();

        const stateUpdate = stateUpdateCall?.[0] as { state: unknown };
        expect(MatchStateSchema.safeParse(stateUpdate.state).success).toBe(true);
    });

    it('stops heartbeat and simulation intervals', async () => {
        const workerModule = await import('./MatchWorker');

        vi.advanceTimersByTime(250);
        vi.mocked(postMessage).mockClear();

        workerModule.stop();
        vi.advanceTimersByTime(1_000);

        expect(postMessage).not.toHaveBeenCalled();
    });
});
