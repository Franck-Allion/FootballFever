import { describe, expect, it } from 'vitest';
import { advanceMatchState, calculateXG, resolveShotForTests } from './MatchSimulation';
import { createInitialMatchState, MatchStateSchema } from './MatchState';
import { isValidTransition } from './MatchZone';

describe('MatchSimulation Logic (Story 7.3)', () => {
  it('should be perfectly deterministic for a whole match', () => {
    const seed = 12345;
    let stateA = createInitialMatchState({
      matchId: 'match-A',
      seed,
      homeRating: { shooting: 68 },
      awayRating: { shooting: 57 }
    });
    let stateB = createInitialMatchState({
      matchId: 'match-B',
      seed,
      homeRating: { shooting: 68 },
      awayRating: { shooting: 57 }
    });
    
    while (!stateA.isComplete || !stateB.isComplete) {
      stateA = advanceMatchState(stateA);
      stateB = advanceMatchState(stateB);
    }
    
    expect(stateA.score).toEqual(stateB.score);
    expect(stateA.homeStats).toEqual(stateB.homeStats);
    expect(stateA.awayStats).toEqual(stateB.awayStats);
    expect(stateA.ballZone).toBe(stateB.ballZone);
    expect(stateA.minute).toBe(90);
    expect(stateA.isComplete).toBe(true);
  });

  it('should accumulate statistics correctly', () => {
    const state = createInitialMatchState({ matchId: 'test', seed: 42 });
    state.ballZone = 'BOX_CENTER_L';
    state.currentPhase = 'OPEN_PLAY';

    const nextState = resolveShotForTests(state, () => 0.99);

    expect(nextState.homeStats.shots).toBe(1);
    expect(nextState.homeStats.xG).toBeGreaterThan(0);
    expect(nextState.homeStats.goals).toBe(0);
    expect(nextState.score.home).toBe(0);
  });

  it('should calculate higher xG for zones closer to goal', () => {
    const boxXG = calculateXG('BOX_CENTER_L');
    const midXG = calculateXG('MID_CENTER_L');
    const defXG = calculateXG('DEF_LEFT');

    expect(boxXG).toBeGreaterThan(midXG);
    expect(midXG).toBeGreaterThan(defXG);
  });

  it('should impact xG based on shooting skill', () => {
    const lowSkillXG = calculateXG('BOX_CENTER_L', 10);
    const highSkillXG = calculateXG('BOX_CENTER_L', 90);

    expect(highSkillXG).toBeGreaterThan(lowSkillXG);
  });

  it('should include distance to goal in xG calculation', () => {
    const highWideXG = calculateXG('HIGH_LEFT', 50);
    const midCenterXG = calculateXG('MID_CENTER_L', 50);

    expect(highWideXG).toBeGreaterThan(midCenterXG);
  });

  it('should clamp invalid shooting skill values to finite non-negative xG', () => {
    expect(calculateXG('BOX_CENTER_L', -100)).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(calculateXG('BOX_CENTER_L', Number.NaN))).toBe(true);
  });

  it('should resolve deterministic goal, save, and miss outcomes', () => {
    const baseState = {
      ...createInitialMatchState({ matchId: 'test', seed: 1, homeRating: { shooting: 100 } }),
      ballZone: 'BOX_CENTER_L' as const,
      currentPhase: 'OPEN_PLAY' as const
    };

    const goalState = resolveShotForTests(baseState, () => 0);
    const saveState = resolveShotForTests(baseState, () => 0.4);
    const missState = resolveShotForTests(baseState, () => 0.99);

    expect(goalState.homeStats.goals).toBe(1);
    expect(goalState.score.home).toBe(1);
    expect(saveState.homeStats.shotsOnTarget).toBe(1);
    expect(saveState.homeStats.goals).toBe(0);
    expect(missState.homeStats.shots).toBe(1);
    expect(missState.homeStats.shotsOnTarget).toBe(0);
  });

  it('should not mutate the previous state when resolving a shot', () => {
    const state = {
      ...createInitialMatchState({ matchId: 'test', seed: 1 }),
      ballZone: 'BOX_CENTER_L' as const,
      currentPhase: 'OPEN_PLAY' as const
    };

    resolveShotForTests(state, () => 0);

    expect(state.homeStats.shots).toBe(0);
    expect(state.score.home).toBe(0);
  });

  it('should place goal-kick restarts at the new possession team end', () => {
    const homeShot = {
      ...createInitialMatchState({ matchId: 'home-shot', seed: 1 }),
      possessionTeam: 'home' as const,
      ballZone: 'BOX_CENTER_L' as const,
      currentPhase: 'OPEN_PLAY' as const
    };
    const awayShot = {
      ...createInitialMatchState({ matchId: 'away-shot', seed: 1 }),
      possessionTeam: 'away' as const,
      ballZone: 'DEF_HALF_LEFT' as const,
      currentPhase: 'OPEN_PLAY' as const
    };

    expect(resolveShotForTests(homeShot, () => 0.99).ballZone).toBe('BOX_CENTER_L');
    expect(resolveShotForTests(awayShot, () => 0.99).ballZone).toBe('DEF_HALF_LEFT');
  });

  it('should not shoot during goal-kick phase', () => {
    const state = {
      ...createInitialMatchState({ matchId: 'test', seed: 43 }),
      ballZone: 'BOX_CENTER_L' as const,
      currentPhase: 'GOAL_KICK' as const
    };

    const nextState = advanceMatchState(state);

    expect(nextState.homeStats.shots + nextState.awayStats.shots).toBe(0);
    expect(nextState.currentPhase).toBe('OPEN_PLAY');
  });

  it('should correctly transition through phases (KICK_OFF -> OPEN_PLAY)', () => {
    const initialState = createInitialMatchState({ matchId: 'test', seed: 1 });
    expect(initialState.currentPhase).toBe('KICK_OFF');

    const nextState = advanceMatchState(initialState);
    expect(nextState.currentPhase).toBe('OPEN_PLAY');
  });

  it('should expose valid zone transitions for grid progression', () => {
    expect(isValidTransition('DEF_LEFT', 'LOWMID_LEFT')).toBe(true);
    expect(isValidTransition('DEF_LEFT', 'BOX_RIGHT')).toBe(false);
  });

  it('should validate full match state with Zod', () => {
    const state = createInitialMatchState({ matchId: 'test', seed: 1 });
    const nextState = advanceMatchState(state);
    
    const result = MatchStateSchema.safeParse(nextState);
    expect(result.success).toBe(true);
  });

  it('should reject invalid match state payloads', () => {
    const state = createInitialMatchState({ matchId: 'test', seed: 1 });

    const invalidState = {
      ...state,
      ballZone: 'UNKNOWN_ZONE',
      second: 58.5,
      score: { home: 1.2, away: 0 }
    };

    const result = MatchStateSchema.safeParse(invalidState);
    expect(result.success).toBe(false);
  });

  it('should reject contradictory score and goal totals', () => {
    const state = createInitialMatchState({ matchId: 'test', seed: 1 });

    const result = MatchStateSchema.safeParse({
      ...state,
      score: { home: 1, away: 0 },
      homeStats: { ...state.homeStats, goals: 0 }
    });

    expect(result.success).toBe(false);
  });

  it('should reject invalid state before advancing simulation', () => {
    const state = createInitialMatchState({ matchId: 'test', seed: 1 });

    expect(() => advanceMatchState({
      ...state,
      ballZone: 'UNKNOWN_ZONE'
    } as typeof state)).toThrow();
  });

  it('should preserve clock overflow when advancing from the end of a minute', () => {
    const state = {
      ...createInitialMatchState({ matchId: 'test', seed: 1 }),
      minute: 12,
      second: 58
    };

    const nextState = advanceMatchState(state);

    expect(nextState.minute).toBe(13);
    expect(nextState.second).toBe(3);
  });
});
