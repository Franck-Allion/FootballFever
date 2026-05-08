import { describe, it, expect } from 'vitest';
import { PlayerFactory } from './PlayerFactory';

describe('PlayerFactory Sanity Test', () => {
    it('generates a squad with players strictly from division 4', () => {
        const factory = PlayerFactory.getInstance();
        const squad = factory.generateInitialSquad(4);
        
        expect(squad.length).toBe(24);
        squad.forEach(player => {
            expect(player.division).toBe(4);
        });
    });

    it('throws error if division does not exist', () => {
        const factory = PlayerFactory.getInstance();
        expect(() => factory.generateInitialSquad(99)).toThrow();
    });
});
