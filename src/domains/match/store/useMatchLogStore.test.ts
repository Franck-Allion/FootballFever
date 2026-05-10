import { describe, expect, it } from 'vitest';
import { useMatchLogStore } from '@domains/match/store/useMatchLogStore';

describe('useMatchLogStore', () => {
    it('initializes with default values', () => {
        const state = useMatchLogStore.getState();
        expect(state.logs).toEqual([]);
        expect(state.currentTime).toEqual({ min: 0, sec: 0 });
        expect(state.homeScore).toBe(0);
        expect(state.awayScore).toBe(0);
        expect(state.isPaused).toBe(false);
        expect(state.isFinished).toBe(false);
    });

    it('sets paused, half-time, and finished states', () => {
        const store = useMatchLogStore.getState();
        
        store.setPaused(true);
        expect(useMatchLogStore.getState().isPaused).toBe(true);
        
        store.setHalfTime(true);
        expect(useMatchLogStore.getState().isHalfTime).toBe(true);
        
        store.setFinished(true);
        expect(useMatchLogStore.getState().isFinished).toBe(true);
    });

    it('updates scores and metadata', () => {
        const store = useMatchLogStore.getState();
        
        store.setScores(2, 1);
        expect(useMatchLogStore.getState().homeScore).toBe(2);
        expect(useMatchLogStore.getState().awayScore).toBe(1);
        
        store.setMatchMetadata('match-123', 999);
        expect(useMatchLogStore.getState().matchId).toBe('match-123');
        expect(useMatchLogStore.getState().seed).toBe(999);
    });

    it('clears all logs and resets state', () => {
        const store = useMatchLogStore.getState();
        store.setScores(5, 5);
        store.setFinished(true);
        
        store.clearLogs();
        
        const state = useMatchLogStore.getState();
        expect(state.homeScore).toBe(0);
        expect(state.isFinished).toBe(false);
        expect(state.logs).toEqual([]);
    });

    it('sets final stamina', () => {
        const store = useMatchLogStore.getState();
        store.setFinalStamina(85, 92);
        expect(useMatchLogStore.getState().finalStamina).toEqual({ home: 85, away: 92 });
    });
});
