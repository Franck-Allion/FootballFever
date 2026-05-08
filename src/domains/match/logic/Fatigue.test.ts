import { describe, expect, it } from 'vitest';
import { advanceMatchState } from './MatchSimulation';
import { createInitialMatchState } from './MatchState';

describe('Match Fatigue Logic (Story 14.1)', () => {
  it('should drain stamina for both teams during a match tick', () => {
    const initialState = createInitialMatchState({
      matchId: 'fatigue-test',
      seed: 123,
      homeTactic: 'balanced',
      awayTactic: 'balanced'
    });

    expect(initialState.homeRating.stamina).toBe(100);
    expect(initialState.awayRating.stamina).toBe(100);

    const nextState = advanceMatchState(initialState);

    expect(nextState.homeRating.stamina).toBeLessThan(100);
    expect(nextState.awayRating.stamina).toBeLessThan(100);
    // 0.05% per minute = 0.0041666% per 5s tick
    expect(nextState.homeRating.stamina).toBeCloseTo(99.99583, 4);
  });

  it('should apply higher drain for high-press tactic', () => {
    const balancedState = createInitialMatchState({
      matchId: 'balanced',
      seed: 1,
      homeTactic: 'balanced'
    });
    const pressState = createInitialMatchState({
      matchId: 'press',
      seed: 1,
      homeTactic: 'high-press'
    });

    const nextBalanced = advanceMatchState(balancedState);
    const nextPress = advanceMatchState(pressState);

    const balancedLoss = 100 - nextBalanced.homeRating.stamina;
    const pressLoss = 100 - nextPress.homeRating.stamina;

    expect(pressLoss).toBeGreaterThan(balancedLoss);
    expect(pressLoss).toBeCloseTo(balancedLoss * 1.18, 5); // Corrected to 1.18
  });

  it('should reduce drain for low-block tactic', () => {
    const balancedState = createInitialMatchState({
      matchId: 'balanced',
      seed: 1,
      homeTactic: 'balanced'
    });
    const lowBlockState = createInitialMatchState({
      matchId: 'low-block',
      seed: 1,
      homeTactic: 'low-block'
    });

    const nextBalanced = advanceMatchState(balancedState);
    const nextLowBlock = advanceMatchState(lowBlockState);

    const balancedLoss = 100 - nextBalanced.homeRating.stamina;
    const lowBlockLoss = 100 - nextLowBlock.homeRating.stamina;

    expect(lowBlockLoss).toBeLessThan(balancedLoss);
    expect(lowBlockLoss).toBeCloseTo(balancedLoss * 0.92, 5); // Corrected to 0.92
  });
});
