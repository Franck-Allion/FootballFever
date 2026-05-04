import { describe, expect, it } from 'vitest';

import { EntityFactory } from '../factories/EntityFactory';
import { PlayerSchema, type FieldPlayerStats, type GoalkeeperStats, type Player } from '../schemas/EntitySchemas';
import { TeamRatingService } from './TeamRatingService';

const fieldPlayer = (
    id: string,
    mainPosition: Player['mainPosition'],
    statBase: number,
    overrides: Partial<Player> = {},
    statOverrides: Partial<FieldPlayerStats> = {}
): Player => EntityFactory.createPlayer({
    id,
    name: id,
    mainPosition,
    secondaryPositions: [],
    overallRating: statBase,
    morale: overrides.morale ?? 50,
    stamina: overrides.stamina ?? 100,
    condition: overrides.condition ?? 100,
    stats: {
        tackling: statBase,
        marking: statBase,
        positioning: statBase,
        passing: statBase,
        vision: statBase,
        clearance: statBase,
        technique: statBase,
        dribbling: statBase,
        pace: statBase,
        acceleration: statBase,
        stamina: statBase,
        power: statBase,
        duels: statBase,
        heading: statBase,
        shooting: statBase,
        finishing: statBase,
        composure: statBase,
        ...statOverrides,
    },
});

const goalkeeper = (id: string, statBase: number): Player => PlayerSchema.parse({
    id,
    name: id,
    rarity: 'Common',
    mainPosition: 'GK',
    secondaryPositions: [],
    overallRating: statBase,
    morale: 50,
    condition: 100,
    stamina: 100,
    level: 1,
    xp: 0,
    xpGainMultiplier: 1,
    potential: statBase,
    age: 25,
    preferredSystem: '4-4-2',
    prestigeValue: 1000,
    stats: {
        lineSaving: statBase,
        reflexes: statBase,
        diving: statBase,
        oneOnOne: statBase,
        aerialClaim: statBase,
        cornerClaim: statBase,
        handDistribution: statBase,
        kicking: statBase,
        positioning: statBase,
        communication: statBase,
        composure: statBase,
    } as GoalkeeperStats,
});

describe('TeamRatingService', () => {
    it('weights player ratings by assigned position instead of using a flat overall average', () => {
        // Arrange
        const striker = fieldPlayer('striker', 'ST', 45, { morale: 80 }, {
            shooting: 92,
            finishing: 90,
            heading: 82,
            pace: 84,
            tackling: 20,
            duels: 35,
        });
        const defender = fieldPlayer('defender', 'CB', 50, {}, {
            tackling: 88,
            duels: 84,
            heading: 82,
            pace: 58,
        });

        // Act
        const strikerAsStriker = TeamRatingService.calculatePlayerPositionRating(striker, 'ST');
        const strikerAsCenterBack = TeamRatingService.calculatePlayerPositionRating(striker, 'CB');
        const defenderAsCenterBack = TeamRatingService.calculatePlayerPositionRating(defender, 'CB');

        // Assert
        expect(strikerAsStriker).toBeGreaterThan(strikerAsCenterBack);
        expect(defenderAsCenterBack).toBeGreaterThan(0);
    });

    it('selects a formation-based starting eleven and calculates team composites', () => {
        // Arrange
        const roster = [
            goalkeeper('gk', 70),
            fieldPlayer('lb', 'LB', 60),
            fieldPlayer('cb-1', 'CB', 65),
            fieldPlayer('cb-2', 'CB', 64),
            fieldPlayer('rb', 'RB', 61),
            fieldPlayer('cdm', 'CDM', 62),
            fieldPlayer('cm-1', 'CM', 63),
            fieldPlayer('cm-2', 'CM', 62),
            fieldPlayer('cam', 'CAM', 66),
            fieldPlayer('st-1', 'ST', 68),
            fieldPlayer('st-2', 'ST', 67),
            fieldPlayer('bench-star', 'ST', 95),
        ];

        // Act
        const rating = TeamRatingService.calculateTeamRating(roster, '4-4-2 DIAMOND');

        // Assert
        expect(rating.startingEleven).toHaveLength(11);
        expect(rating.composites.attack).toBeGreaterThan(0);
        expect(rating.composites.midfield).toBeGreaterThan(0);
        expect(rating.composites.defense).toBeGreaterThan(0);
        expect(rating.overallRating).toBeGreaterThan(0);
        expect(rating.overallRating).toBeLessThanOrEqual(100);
    });

    it('reflects morale and fatigue because both affect match probability in the algorithm', () => {
        // Arrange
        const freshConfidentLineup = [
            goalkeeper('fresh-gk', 60),
            ...Array.from({ length: 10 }, (_, index) =>
                fieldPlayer(`fresh-${index}`, 'CM', 60, { morale: 90, stamina: 90, condition: 90 })
            ),
        ].map((player) => ({ ...player, morale: 90, stamina: 90, condition: 90 }));
        const tiredLowMoraleLineup = [
            goalkeeper('tired-gk', 60),
            ...Array.from({ length: 10 }, (_, index) =>
                fieldPlayer(`tired-${index}`, 'CM', 60, { morale: 20, stamina: 30, condition: 40 })
            ),
        ].map((player) => ({ ...player, morale: 20, stamina: 30, condition: 40 }));

        // Act
        const freshRating = TeamRatingService.calculateTeamRating(freshConfidentLineup, '4-4-2 DIAMOND');
        const tiredRating = TeamRatingService.calculateTeamRating(tiredLowMoraleLineup, '4-4-2 DIAMOND');

        // Assert
        expect(freshRating.overallRating).toBeGreaterThan(tiredRating.overallRating);
        expect(freshRating.morale).toBe(90);
        expect(freshRating.staminaAvg).toBe(90);
        expect(tiredRating.morale).toBe(20);
        expect(tiredRating.staminaAvg).toBe(30);
    });
});
