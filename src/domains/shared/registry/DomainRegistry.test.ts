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

    it('clears all collections when clear is called', () => {
        const player = EntityFactory.createPlayer();
        registry.registerPlayer(player);
        
        registry.clear();
        
        expect(registry.getPlayer(player.id)).toBeUndefined();
    });

    it('throws error when registering before schema is configured', () => {
        DomainRegistry.resetInstance();
        const newRegistry = DomainRegistry.getInstance();
        
        expect(() => newRegistry.registerPlayer({ id: '1' } as unknown as z.infer<typeof PlayerSchema>)).toThrow();
    });

    it('throws error when getting from unconfigured collection', () => {
        DomainRegistry.resetInstance();
        const newRegistry = DomainRegistry.getInstance();
        
        expect(() => newRegistry.getPlayer('1')).toThrow();
    });

    it('deep freezes complex objects', () => {
        const ComplexSchema = zod.object({
            id: zod.string(),
            data: zod.object({
                nested: zod.array(zod.number())
            })
        });
        
        registry.registerSchema('complex', ComplexSchema);
        registry.register('complex', { id: 'c1', data: { nested: [1, 2] } });
        
        const retrieved = registry.get<zod.infer<typeof ComplexSchema>>('complex', 'c1');
        expect(Object.isFrozen(retrieved.data)).toBe(true);
        expect(Object.isFrozen(retrieved.data.nested)).toBe(true);
    });

    it('returns undefined when getting non-existent entity', () => {
        expect(registry.getPlayer('non-existent')).toBeUndefined();
    });

    it('deepFreeze should handle null and non-object values gracefully', () => {
        // We can't easily call private deepFreeze, but we can register objects with null/non-object values
        const NullSchema = zod.object({
            id: zod.string(),
            data: zod.nullable(zod.any())
        });
        registry.registerSchema('nulltest', NullSchema);
        registry.register('nulltest', { id: 'n1', data: null });
        registry.register('nulltest', { id: 'n2', data: 42 });
        
        expect(registry.get('nulltest', 'n1')).toEqual({ id: 'n1', data: null });
        expect(registry.get('nulltest', 'n2')).toEqual({ id: 'n2', data: 42 });
    });

    it('throws when getting from a non-existent collection', () => {
        expect(() => registry.get('ghost', 'any')).toThrow();
    });
});
