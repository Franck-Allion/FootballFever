import { indexedDB, IDBKeyRange } from 'fake-indexeddb';

globalThis.indexedDB = indexedDB;
globalThis.IDBKeyRange = IDBKeyRange;

import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseService } from './DatabaseService';
// eslint-disable-next-line no-restricted-imports -- Story 2.1 requires validation against shared domain schemas.        
import { EntityFactory } from '@domains/shared/factories/EntityFactory';
// eslint-disable-next-line no-restricted-imports -- Story 2.1 requires validation against shared domain schemas.        
import type { GameStateData, Player, Team } from '@domains/shared/schemas/EntitySchemas';

describe('DatabaseService', () => {
    let service: DatabaseService;

    beforeEach(async () => {
        DatabaseService.resetInstanceForTests();
        service = DatabaseService.getInstance({ indexedDB, IDBKeyRange });
        await service.clearAll();
    });

    it('should save and load a player correctly', async () => {
        const player = EntityFactory.createPlayer({ id: 'test-p1', name: 'Test Player' });
        await service.savePlayer(player);

        const loaded = await service.loadPlayer('test-p1');
        expect(loaded).toBeDefined();
        expect(loaded?.name).toBe('Test Player');
        expect(loaded?.stats.pace).toBe(player.stats.pace);
    });

    it('should throw validation error when saving invalid player data', async () => {
        const invalidPlayer = {
            id: 'invalid',
            name: '',
            rarity: 'Common',
            mainPosition: 'ST',
            stats: {
                pace: 101,
                shooting: 50
            },
            level: 1,
            xp: 0,
            age: 18,
            potential: 80,
            prestigeValue: 1000
        };

        await expect(service.savePlayer(invalidPlayer as unknown as Player)).rejects.toThrow();
    });

    it('should save and load a team correctly', async () => {
        const player = EntityFactory.createPlayer({ id: 'p1' });
        const team: Team = {
            id: 'team-1',
            name: 'Test Team',
            roster: [player.id],
            formation: '4-3-3'
        };

        await service.saveTeam(team);
        const loaded = await service.loadTeam('team-1');

        expect(loaded).toBeDefined();
        expect(loaded?.name).toBe('Test Team');
        expect(loaded?.roster).toContain('p1');
    });

    it('should save and load global game state correctly', async () => {
        const state: GameStateData = {
            id: 'current_session',
            currentState: 'HUB',
            prestige: 1000,
            lastSaved: new Date().toISOString()
        };

        await service.saveGlobalState(state);
        const loaded = await service.loadGlobalState();

        expect(loaded).toBeDefined();
        expect(loaded?.currentState).toBe('HUB');
        expect(loaded?.prestige).toBe(1000);
    });

    it('should load all players', async () => {
        const p1 = EntityFactory.createPlayer({ id: 'p1' });
        const p2 = EntityFactory.createPlayer({ id: 'p2' });

        await service.savePlayer(p1);
        await service.savePlayer(p2);

        const all = await service.loadAllPlayers();
        expect(all.length).toBe(2);
        expect(all.map((player) => player.id)).toContain('p1');
        expect(all.map((player) => player.id)).toContain('p2');
    });

    it('should return undefined when loading non-existent player', async () => {
        const loaded = await service.loadPlayer('non-existent');
        expect(loaded).toBeUndefined();
    });

    it('should return undefined when loading non-existent team', async () => {
        const loaded = await service.loadTeam('non-existent');
        expect(loaded).toBeUndefined();
    });

    it('should return undefined when loading non-existent global state', async () => {
        const loaded = await service.loadGlobalState('non-existent');
        expect(loaded).toBeUndefined();
    });

    it('should load all teams', async () => {
        const t1: Team = { id: 't1', name: 'T1', roster: ['p1'], formation: '442' };
        const t2: Team = { id: 't2', name: 'T2', roster: ['p2'], formation: '433' };
        await service.saveTeam(t1);
        await service.saveTeam(t2);

        const all = await service.loadAllTeams();
        expect(all.length).toBe(2);
    });

    it('should delete a player', async () => {
        const p1 = EntityFactory.createPlayer({ id: 'p1' });
        await service.savePlayer(p1);
        await service.deletePlayer('p1');
        const loaded = await service.loadPlayer('p1');
        expect(loaded).toBeUndefined();
    });

    it('should close the database', async () => {
        await expect(service.close()).resolves.toBeUndefined();
    });
});
