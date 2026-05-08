import { describe, it, expect, beforeEach } from 'vitest';
import { useMatchLogStore } from './useMatchLogStore';

describe('useMatchLogStore', () => {
    beforeEach(() => {
        useMatchLogStore.getState().clearLogs();
    });

    it('adds logs correctly and keeps newest first', () => {
        const store = useMatchLogStore.getState();
        store.addLog({ id: '1', minute: 1, second: 0, text: 'test1', type: 'EVENT' });
        store.addLog({ id: '2', minute: 2, second: 0, text: 'test2', type: 'EVENT' });

        const state = useMatchLogStore.getState();
        expect(state.logs).toHaveLength(2);
        expect(state.logs[0].id).toBe('2');
    });

    it('clears all state', () => {
        const store = useMatchLogStore.getState();
        store.setScores(2, 1);
        store.setPaused(true);
        store.clearLogs();

        const state = useMatchLogStore.getState();
        expect(state.homeScore).toBe(0);
        expect(state.isPaused).toBe(false);
        expect(state.logs).toHaveLength(0);
    });

    it('updates various status flags', () => {
        const store = useMatchLogStore.getState();
        
        store.setHalfTime(true);
        expect(useMatchLogStore.getState().isHalfTime).toBe(true);

        store.setFinished(true);
        expect(useMatchLogStore.getState().isFinished).toBe(true);

        store.setMatchMetadata('m1', 123);
        expect(useMatchLogStore.getState().matchId).toBe('m1');
        expect(useMatchLogStore.getState().seed).toBe(123);
    });
});
