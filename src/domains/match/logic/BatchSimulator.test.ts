import { describe, it, expect } from 'vitest';
import { runBatchSimulation, BatchSimulationConfigSchema, checkInvariants } from './BatchSimulator';
import { createInitialMatchState } from './MatchState';

describe('BatchSimulator', () => {
  it('should reject invalid configuration', () => {
    const invalidConfig = {
      matchCount: 0, // Must be at least 1
      baseSeed: 123
    };
    
    const result = BatchSimulationConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should reject batch sizes exceeding safety limit', () => {
    const invalidConfig = {
      matchCount: 10001,
      baseSeed: 123
    };
    
    const result = BatchSimulationConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should produce identical results for the same config (determinism)', () => {
    const config = {
      matchCount: 5,
      baseSeed: 999
    };
    
    const result1 = runBatchSimulation(config);
    const result2 = runBatchSimulation(config);
    
    expect(result1.aggregates).toEqual(result2.aggregates);
    expect(result1.matches.map(m => m.matchId)).toEqual(result2.matches.map(m => m.matchId));
  });

  it('should run a smoke batch and return valid metrics', () => {
    const config = {
      matchCount: 3,
      baseSeed: 42
    };
    
    const result = runBatchSimulation(config);
    
    expect(result.matches).toHaveLength(3);
    expect(result.aggregates.totalMatches).toBe(3);
    expect(result.aggregates.averageGoalsPerMatch).toBeGreaterThanOrEqual(0);
    expect(result.aggregates.averageShotsOnTargetPerTeam).toBeDefined();
    expect(result.aggregates.homeWinRate + result.aggregates.drawRate + result.aggregates.awayWinRate).toBeCloseTo(1, 5);
    expect(result.invariantFailures).toHaveLength(0);
  });

  it('should detect loop safety trigger', () => {
    const result = runBatchSimulation({
      matchCount: 1,
      baseSeed: 1,
      maxTicksPerMatch: 5 // Too short to finish a 90m match
    });
    
    expect(result.invariantFailures).toContainEqual(expect.objectContaining({
      code: 'LOOP_SAFETY_TRIGGERED'
    }));
  });

  describe('checkInvariants', () => {
    it('should detect score/goal mismatch', () => {
      const state = createInitialMatchState({ matchId: 'test', seed: 1 });
      state.score.home = 2;
      state.homeStats.goals = 1; // Mismatch
      
      const failures = checkInvariants(state, 0);
      expect(failures).toContainEqual(expect.objectContaining({
        code: 'SCORE_MISMATCH_HOME'
      }));
    });

    it('should detect shots on target exceeding total shots', () => {
      const state = createInitialMatchState({ matchId: 'test', seed: 1 });
      state.homeStats.shots = 5;
      state.homeStats.shotsOnTarget = 6; // Invalid
      
      const failures = checkInvariants(state, 0);
      expect(failures).toContainEqual(expect.objectContaining({
        code: 'SHOTS_ON_TARGET_EXCEED_TOTAL_HOME'
      }));
    });

    it('should detect goals exceeding shots on target', () => {
      const state = createInitialMatchState({ matchId: 'test', seed: 1 });
      state.awayStats.shotsOnTarget = 2;
      state.awayStats.goals = 3;
      state.score.away = 3; // Keep score sync to only trigger goal/SOT mismatch
      
      const failures = checkInvariants(state, 0);
      expect(failures).toContainEqual(expect.objectContaining({
        code: 'GOALS_EXCEED_SHOTS_ON_TARGET_AWAY'
      }));
    });

    it('should detect invalid xG', () => {
      const state = createInitialMatchState({ matchId: 'test', seed: 1 });
      state.homeStats.xG = -0.5;
      
      const failures = checkInvariants(state, 0);
      expect(failures).toContainEqual(expect.objectContaining({
        code: 'INVALID_XG_HOME'
      }));
    });

    it('should detect possession overflow', () => {
      const state = createInitialMatchState({ matchId: 'test', seed: 1 });
      state.minute = 10;
      state.second = 0; // 600 seconds match
      state.homeStats.possessionSeconds = 400;
      state.awayStats.possessionSeconds = 300; // Total 700 > 600 + 5
      
      const failures = checkInvariants(state, 0);
      expect(failures).toContainEqual(expect.objectContaining({
        code: 'POSSESSION_OVERFLOW'
      }));
    });

    it('should detect possession underflow', () => {
      const state = createInitialMatchState({ matchId: 'test', seed: 1 });
      state.minute = 10;
      state.second = 0; // 600 seconds match
      state.homeStats.possessionSeconds = 200;
      state.awayStats.possessionSeconds = 200; // Total 400 < 600 - 5
      
      const failures = checkInvariants(state, 0);
      expect(failures).toContainEqual(expect.objectContaining({
        code: 'POSSESSION_UNDERFLOW'
      }));
    });
  });
});
