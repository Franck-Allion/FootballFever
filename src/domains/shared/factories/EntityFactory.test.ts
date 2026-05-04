import { describe, expect, it } from 'vitest';

import { EntityFactory } from './EntityFactory';

describe('EntityFactory', () => {
    it('creates valid player entities without using mutable shared state', () => {
        EntityFactory.resetCounters();
        const player = EntityFactory.createPlayer();

        expect(player.id).toBeTruthy();
        expect(player.stats.pace).toBeGreaterThanOrEqual(0);
        expect(player.stats.pace).toBeLessThanOrEqual(100);
        expect(player.rarity).toBe('Common');
        expect(player.mainPosition).toBe('ST');
    });
});
