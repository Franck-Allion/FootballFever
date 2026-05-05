import { describe, expect, it } from 'vitest';

import { EntityFactory } from '../factories/EntityFactory';
import { PlayerSchema, type FieldPlayerStats, type GoalkeeperStats, type Player } from '../schemas/EntitySchemas';
import { LineupService } from './LineupService';

const fieldPlayer = (
    id: string,
    mainPosition: Player['mainPosition'],
    base: number,
    secondaryPositions: Player['secondaryPositions'] = [],
    statOverrides: Partial<FieldPlayerStats> = {}
): Player => EntityFactory.createPlayer({
    id,
    name: id,
    mainPosition,
    secondaryPositions,
    overallRating: base,
    morale: base,
    stamina: base,
    condition: base,
    stats: {
        tackling: base,
        marking: base,
        positioning: base,
        passing: base,
        vision: base,
        clearance: base,
        technique: base,
        dribbling: base,
        pace: base,
        acceleration: base,
        stamina: base,
        power: base,
        duels: base,
        heading: base,
        shooting: base,
        finishing: base,
        composure: base,
        ...statOverrides,
    },
});

const goalkeeper = (id: string, base: number): Player => PlayerSchema.parse({
    id,
    name: id,
    rarity: 'Common',
    mainPosition: 'GK',
    secondaryPositions: [],
    overallRating: base,
    morale: base,
    condition: base,
    stamina: base,
    level: 1,
    xp: 0,
    xpGainMultiplier: 1,
    potential: base,
    age: 25,
    preferredSystem: '4-4-2',
    prestigeValue: 1000,
    stats: {
        lineSaving: base,
        reflexes: base,
        diving: base,
        oneOnOne: base,
        aerialClaim: base,
        cornerClaim: base,
        handDistribution: base,
        kicking: base,
        positioning: base,
        communication: base,
        composure: base,
    } as GoalkeeperStats,
});

describe('LineupService', () => {
    it('generates eleven pitch slots for every supported formation and exactly one GK bench slot', () => {
        // Arrange
        const formations = LineupService.getSupportedFormations();

        // Act / Assert
        formations.forEach((formation) => {
            const slots = LineupService.getFormationSlots(formation);
            expect(slots).toHaveLength(11);
            expect(slots.filter((slot) => slot.position === 'GK')).toHaveLength(1);
        });

        const benchSlots = LineupService.getBenchSlots();
        expect(benchSlots).toHaveLength(5);
        expect(benchSlots.filter((slot) => slot.accepts === 'GK')).toHaveLength(1);
        expect(benchSlots.filter((slot) => slot.accepts === 'FIELD')).toHaveLength(4);
    });

    it('returns best, adapted, and invalid eligibility including GK-only restrictions', () => {
        // Arrange
        const slots = LineupService.getFormationSlots('4-3-3');
        const strikerSlot = slots.find((slot) => slot.id === 'st')!;
        const centerBackSlot = slots.find((slot) => slot.id === 'cb-l')!;
        const gkPitchSlot = slots.find((slot) => slot.id === 'gk')!;
        const gkBenchSlot = LineupService.getBenchSlots().find((slot) => slot.id === 'bench-gk')!;
        const fieldBenchSlot = LineupService.getBenchSlots().find((slot) => slot.id === 'bench-1')!;
        const striker = fieldPlayer('st', 'ST', 70, ['CF']);
        const winger = fieldPlayer('lw', 'LW', 70);
        const keeper = goalkeeper('gk', 70);

        // Act / Assert
        expect(LineupService.getPositionEligibility(striker, strikerSlot)).toBe('best');
        expect(LineupService.getPositionEligibility(winger, strikerSlot)).toBe('adapted');
        expect(LineupService.getPositionEligibility(striker, centerBackSlot)).toBe('invalid');
        expect(LineupService.getPositionEligibility(keeper, strikerSlot)).toBe('invalid');
        expect(LineupService.getPositionEligibility(striker, gkPitchSlot)).toBe('invalid');
        expect(LineupService.getPositionEligibility(keeper, gkBenchSlot)).toBe('best');
        expect(LineupService.getPositionEligibility(striker, gkBenchSlot)).toBe('invalid');
        expect(LineupService.getPositionEligibility(keeper, fieldBenchSlot)).toBe('invalid');
    });

    it('swaps occupied pitch and bench destinations while preserving hard eligibility', () => {
        // Arrange
        const roster = [
            goalkeeper('starter-gk', 75),
            goalkeeper('bench-gk', 65),
            fieldPlayer('st-a', 'ST', 80),
            fieldPlayer('st-b', 'ST', 72),
        ];
        const lineupSlots = {
            ...LineupService.createEmptyLineup('4-4-2 DIAMOND'),
            gk: 'starter-gk',
            'st-l': 'st-a',
        };
        const benchSlots = {
            ...LineupService.createEmptyBench(),
            'bench-gk': 'bench-gk',
            'bench-1': 'st-b',
        };

        // Act
        const swapped = LineupService.movePlayer({
            roster,
            formation: '4-4-2 DIAMOND',
            lineupSlots,
            benchSlots,
            playerId: 'st-b',
            destination: { area: 'pitch', slotId: 'st-l' },
        });
        const invalidGkMove = LineupService.movePlayer({
            roster,
            formation: '4-4-2 DIAMOND',
            lineupSlots: swapped.lineupSlots,
            benchSlots: swapped.benchSlots,
            playerId: 'bench-gk',
            destination: { area: 'bench', slotId: 'bench-1' },
        });

        // Assert
        expect(swapped.moved).toBe(true);
        expect(swapped.lineupSlots['st-l']).toBe('st-b');
        expect(swapped.benchSlots['bench-1']).toBe('st-a');
        expect(invalidGkMove.moved).toBe(false);
        expect(invalidGkMove.benchSlots['bench-gk']).toBe('bench-gk');
    });

    it('preserves current starters as much as possible when changing formation', () => {
        // Arrange
        const roster = [
            goalkeeper('gk', 70),
            fieldPlayer('left-back', 'LB', 70),
            fieldPlayer('center-mid', 'CM', 70),
            fieldPlayer('striker', 'ST', 70),
        ];
        const lineupSlots = {
            ...LineupService.createEmptyLineup('4-4-2 DIAMOND'),
            gk: 'gk',
            lb: 'left-back',
            'cm-l': 'center-mid',
            'st-l': 'striker',
        };

        // Act
        const remapped = LineupService.remapAssignmentsForFormation({
            roster,
            fromFormation: '4-4-2 DIAMOND',
            toFormation: '4-3-3',
            lineupSlots,
            benchSlots: LineupService.createEmptyBench(),
        });

        // Assert
        expect(remapped.lineupSlots.gk).toBe('gk');
        expect(remapped.lineupSlots.lb).toBe('left-back');
        expect(Object.values(remapped.lineupSlots)).toContain('center-mid');
        expect(Object.values(remapped.lineupSlots)).toContain('striker');
    });

    it('can keep a starter on an unsuitable field slot during formation remap so the UI can flag it', () => {
        // Arrange
        const roster = [
            goalkeeper('gk', 70),
            fieldPlayer('wide-mid', 'LM', 70),
        ];
        const lineupSlots = {
            ...LineupService.createEmptyLineup('4-4-2 DIAMOND'),
            gk: 'gk',
            'st-l': 'wide-mid',
        };

        // Act
        const remapped = LineupService.remapAssignmentsForFormation({
            roster,
            fromFormation: '4-4-2 DIAMOND',
            toFormation: '4-3-3',
            lineupSlots,
            benchSlots: LineupService.createEmptyBench(),
        });
        const remappedSlot = LineupService.getFormationSlots('4-3-3').find((slot) => remapped.lineupSlots[slot.id] === 'wide-mid')!;

        // Assert
        expect(remappedSlot.position).not.toBe('LM');
        expect(LineupService.getPositionEligibility(roster[1]!, remappedSlot)).toBe('invalid');
    });

    it('recomputes team rating from assigned starters before falling back to auto-selection', () => {
        // Arrange
        const roster = [
            goalkeeper('gk', 70),
            fieldPlayer('weak-st', 'ST', 40, [], { shooting: 35, finishing: 35 }),
            fieldPlayer('elite-st', 'ST', 95, [], { shooting: 99, finishing: 99 }),
        ];
        const lineupSlots = {
            ...LineupService.createEmptyLineup('4-4-2 DIAMOND'),
            gk: 'gk',
            'st-l': 'weak-st',
        };

        // Act
        const assignedRating = LineupService.calculateAssignedTeamRating(roster, '4-4-2 DIAMOND', lineupSlots);
        const automaticRating = LineupService.calculateAssignedTeamRating(
            roster,
            '4-4-2 DIAMOND',
            LineupService.createEmptyLineup('4-4-2 DIAMOND')
        );

        // Assert
        expect(assignedRating.startingEleven.map(({ player }) => player.id)).toContain('weak-st');
        expect(automaticRating.startingEleven.map(({ player }) => player.id)).toContain('elite-st');
        expect(automaticRating.overallRating).toBeGreaterThan(assignedRating.overallRating);
    });
});
