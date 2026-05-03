import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('MatchWorker', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.useFakeTimers();
        vi.stubGlobal('postMessage', vi.fn());
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
        expect(postMessage).toHaveBeenLastCalledWith({
            type: 'heartbeat',
            timestamp: expect.any(Number),
            sequence: 2
        });
    });
});
