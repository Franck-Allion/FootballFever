import { describe, expect, it, beforeEach } from 'vitest';
import { CommentaryService } from './CommentaryService';
import { MatchState } from '../logic/MatchState';

describe('CommentaryService', () => {
    let service: CommentaryService;

    beforeEach(() => {
        service = CommentaryService.getInstance();
        service.reset();
    });

    const createMockState = (overrides: Partial<MatchState> = {}): MatchState => ({
        minute: 0,
        second: 0,
        currentPhase: 'OPEN_PLAY',
        score: { home: 0, away: 0 },
        homeStats: { shots: 0, shotsOnTarget: 0, possession: 50 },
        awayStats: { shots: 0, shotsOnTarget: 0, possession: 50 },
        isComplete: false,
        ballOwner: 'HOME',
        ballZone: 5,
        homeTeam: {} as any,
        awayTeam: {} as any,
        ...overrides,
    } as MatchState);

    it('generates kickoff log when no previous state exists', () => {
        const state = createMockState({ minute: 0, currentPhase: 'OPEN_PLAY' });
        const logs = service.generateLog(state);
        
        expect(logs).toHaveLength(1);
        expect(logs[0].text).toBe('match.kickoff');
    });

    it('generates half time log when crossing 45 minute mark', () => {
        const prev = createMockState({ minute: 44 });
        const curr = createMockState({ minute: 45 });
        const logs = service.generateLog(curr, prev);
        
        expect(logs).toHaveLength(1);
        expect(logs[0].text).toBe('match.half_time');
    });

    it('generates goal logs for home and away teams', () => {
        const prev = createMockState({ score: { home: 0, away: 0 } });
        
        const homeGoal = createMockState({ score: { home: 1, away: 0 } });
        const homeLogs = service.generateLog(homeGoal, prev);
        expect(homeLogs[0].text).toBe('match.goal_home');
        
        const awayGoal = createMockState({ score: { home: 0, away: 1 } });
        const awayLogs = service.generateLog(awayGoal, prev);
        expect(awayLogs[0].text).toBe('match.goal_away');
    });

    it('generates shot miss logs', () => {
        const prev = createMockState({ homeStats: { shots: 0 } as any, awayStats: { shots: 0 } as any });
        
        const homeMiss = createMockState({ homeStats: { shots: 1 } as any });
        const homeLogs = service.generateLog(homeMiss, prev);
        expect(homeLogs[0].text).toBe('match.shot_miss_home');
        
        const awayMiss = createMockState({ awayStats: { shots: 1 } as any });
        const awayLogs = service.generateLog(awayMiss, prev);
        expect(awayLogs[0].text).toBe('match.shot_miss_away');
    });

    it('generates periodic momentum comments every 10 minutes', () => {
        const prev = createMockState({ minute: 9, currentPhase: 'OPEN_PLAY' });
        const state10 = createMockState({ minute: 10, currentPhase: 'OPEN_PLAY' });
        const logs10 = service.generateLog(state10, prev);
        expect(logs10[0].text).toBe('match.momentum_neutral');

        service.reset();
        const state20 = createMockState({ minute: 20, currentPhase: 'OPEN_PLAY' });
        const logs20 = service.generateLog(state20, prev);
        expect(logs20[0].text).toBe('match.momentum_neutral');
    });

    it('generates full time log when match is complete', () => {
        const prev = createMockState({ isComplete: false });
        const curr = createMockState({ isComplete: true });
        const logs = service.generateLog(curr, prev);
        
        expect(logs).toHaveLength(1);
        expect(logs[0].text).toBe('match.full_time');
    });
});
