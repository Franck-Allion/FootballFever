import { describe, expect, it } from 'vitest';
import { HumanManagementService } from './HumanManagementService';
import { EntityFactory } from '../factories/EntityFactory';

describe('HumanManagementService (Story 14.1)', () => {
  const mockPlayer = EntityFactory.createPlayer({
    id: 'player-1',
    morale: 50,
    condition: 100,
    stamina: 100
  });

  it('should increase morale on win with seeded variety', () => {
    const evolved = HumanManagementService.evolvePlayerAfterMatch(mockPlayer, {
      outcome: 'win',
      playedInMatch: false,
      seed: 123
    });

    // Seed 123 + ID 1 -> roll ~0.026 -> variance 0 -> 5 + 0 = 5
    expect(evolved.morale).toBe(55);
  });

  it('should decrease morale on loss with seeded variety', () => {
    const evolved = HumanManagementService.evolvePlayerAfterMatch(mockPlayer, {
      outcome: 'loss',
      playedInMatch: false,
      seed: 456
    });

    // Seed 456 + ID 1 -> roll ~0.72 -> variance 4 -> -(5 + 4) = -9
    expect(evolved.morale).toBe(41);
  });

  it('should impact condition based on stamina loss for players who played', () => {
    const evolved = HumanManagementService.evolvePlayerAfterMatch(mockPlayer, {
      outcome: 'win',
      playedInMatch: true,
      finalStamina: 80, // 20% loss
      seed: 1
    });

    expect(evolved.stamina).toBe(80);
    // 100 - (20 * 0.5) = 90
    expect(evolved.condition).toBe(90);
  });

  it('should increase morale slightly on draw', () => {
    const evolved = HumanManagementService.evolvePlayerAfterMatch(mockPlayer, {
      outcome: 'draw',
      playedInMatch: false,
      seed: 789
    });

    // Seed 789 + ID 1 -> roll ~0.26 -> 1 + floor(0.26 * 3) = 1 + 0 = 1
    expect(evolved.morale).toBe(51);
  });

  it('should recover condition during rest', () => {
    const tiredPlayer = { ...mockPlayer, condition: 70, stamina: 80 };
    const recovered = HumanManagementService.applyRestRecovery(tiredPlayer);

    expect(recovered.stamina).toBe(100);
    expect(recovered.condition).toBe(85); // 70 + 15
  });

  it('should floor condition at 0 for extreme fatigue', () => {
    const tiredPlayer = { ...mockPlayer, condition: 5 };
    const evolved = HumanManagementService.evolvePlayerAfterMatch(tiredPlayer, {
      outcome: 'loss',
      playedInMatch: true,
      finalStamina: 10, // 90% loss -> -45 condition
      seed: 1
    });

    expect(evolved.condition).toBe(0);
  });

  it('should cap stats at 100 and floor at 0', () => {
    const topPlayer = { ...mockPlayer, morale: 98, condition: 95 };
    const evolved = HumanManagementService.evolvePlayerAfterMatch(topPlayer, {
      outcome: 'win',
      playedInMatch: true,
      finalStamina: 100,
      seed: 1
    });

    expect(evolved.morale).toBe(100);
    expect(evolved.condition).toBe(95);

    const bottomPlayer = { ...mockPlayer, morale: 5, condition: 2 };
    const crushed = HumanManagementService.evolvePlayerAfterMatch(bottomPlayer, {
      outcome: 'loss',
      playedInMatch: true,
      finalStamina: 90, // 10% loss -> -5 condition
      seed: 1
    });

    expect(crushed.morale).toBe(0);
    expect(crushed.condition).toBe(0);
  });
});
