import { beforeEach, describe, expect, it } from 'vitest';
import type { z } from 'zod';
import { z as zod } from 'zod';

import { DomainRegistry } from '../../../core/services/registry/DomainRegistry';
import { EntityFactory } from '../factories/EntityFactory';
import { PlayerSchema, TeamSchema } from '../schemas/EntitySchemas';

describe('DomainRegistry', () => {
    let registry: DomainRegistry;

    beforeEach(() => {
        DomainRegistry.resetInstance();
        EntityFactory.resetCounters();
        registry = DomainRegistry.getInstance();
        registry.configureSchemas({
            playerSchema: PlayerSchema,
            teamSchema: TeamSchema
        });
    });

    it('rejects invalid player data during registration', () => {
        const invalidPlayer = {
            ...EntityFactory.createPlayer(),
            stats: {
                pace: 101,
                shooting: 80,
                passing: 80,
                dribbling: 80,
                defense: 80,
                physical: 80
            }
        };

        expect(() => registry.registerPlayer(invalidPlayer)).toThrowError();
    });

    it('returns defensive immutable copies for registered players', () => {
        const player = EntityFactory.createPlayer();

        registry.registerPlayer(player);
        const storedPlayer = registry.getPlayer<z.infer<typeof PlayerSchema>>(player.id);

        expect(storedPlayer).toEqual(player);
        expect(storedPlayer).not.toBe(player);
        expect(Object.isFrozen(storedPlayer)).toBe(true);
        expect(Object.isFrozen(storedPlayer?.stats)).toBe(true);
    });

    it('registers and returns teams using configured schemas', () => {
        const player = EntityFactory.createPlayer();
        const team = {
            id: 'team-1',
            name: 'Paris FC',
            roster: [player.id],
            formation: '4-3-3'
        };

        registry.registerTeam(team);

        expect(registry.getTeam<z.infer<typeof TeamSchema>>(team.id)).toEqual(team);
    });

    it('supports extensible typed registration beyond player/team wrappers', () => {
        const StadiumSchema = zod.object({
            id: zod.string().min(1),
            name: zod.string().min(1),
            capacity: zod.number().int().positive()
        }).strict();

        type Stadium = zod.infer<typeof StadiumSchema>;
        const stadium: Stadium = {
            id: 'stadium-1',
            name: 'Parc Central',
            capacity: 48000
        };

        registry.registerSchema('stadium', StadiumSchema);
        registry.register<Stadium>('stadium', stadium);

        const retrieved = registry.get<Stadium>('stadium', stadium.id);

        expect(retrieved).toEqual(stadium);
        expect(retrieved).not.toBe(stadium);
        expect(Object.isFrozen(retrieved)).toBe(true);
    });
});
