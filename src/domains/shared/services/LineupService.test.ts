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

    it('handles unassigning a player back to the squad pool', () => {
        // Arrange
        const roster = [fieldPlayer('p1', 'ST', 70)];
        const lineupSlots = { ...LineupService.createEmptyLineup('4-3-3'), st: 'p1' };
        const benchSlots = LineupService.createEmptyBench();

        // Act
        const result = LineupService.movePlayer({
            roster,
            formation: '4-3-3',
            lineupSlots,
            benchSlots,
            playerId: 'p1',
            destination: { area: 'unassign', slotId: 'root' },
        });

        // Assert
        expect(result.moved).toBe(true);
        expect(result.lineupSlots.st).toBe(null);
    });

    it('calculates adjusted rating based on position efficiency', () => {
        // Arrange
        const striker = fieldPlayer('st', 'ST', 80, ['CF']);
        const slots = LineupService.getFormationSlots('4-3-3');
        const stSlot = slots.find(s => s.id === 'st')!;
        const lwSlot = slots.find(s => s.id === 'lw')!;
        const cbSlot = slots.find(s => s.id === 'cb-l')!;

        // Act
        const perfectRating = LineupService.getAdjustedRating(striker, stSlot);
        const secondaryRating = LineupService.getAdjustedRating(striker, { ...stSlot, position: 'CF' });
        const sameLineRating = LineupService.getAdjustedRating(striker, lwSlot);
        const outOfPositionRating = LineupService.getAdjustedRating(striker, cbSlot);

        // Assert
        expect(perfectRating).toBeGreaterThan(70); // Natural ST
        expect(secondaryRating).toBeLessThan(perfectRating); // Penalized by efficiency 0.85
        expect(sameLineRating).toBeLessThan(secondaryRating); // Penalized by efficiency 0.5
        expect(outOfPositionRating).toBeLessThan(sameLineRating); // Penalized by efficiency 0.25
    });

    it('blocks moving field players to GK slots and vice versa', () => {
        // Arrange
        const roster = [fieldPlayer('st', 'ST', 80), goalkeeper('gk', 80)];
        const lineupSlots = LineupService.createEmptyLineup('4-3-3');
        const benchSlots = LineupService.createEmptyBench();

        // Act
        const moveFieldToGk = LineupService.movePlayer({
            roster,
            formation: '4-3-3',
            lineupSlots,
            benchSlots,
            playerId: 'st',
            destination: { area: 'pitch', slotId: 'gk' },
        });
        const moveGkToField = LineupService.movePlayer({
            roster,
            formation: '4-3-3',
            lineupSlots,
            benchSlots,
            playerId: 'gk',
            destination: { area: 'pitch', slotId: 'st' },
        });

        // Assert
        expect(moveFieldToGk.moved).toBe(false);
        expect(moveGkToField.moved).toBe(false);
    });

    it('blocks unassigning a player who is already unassigned', () => {
        const roster = [fieldPlayer('p1', 'ST', 70)];
        const result = LineupService.movePlayer({
            roster,
            formation: '4-3-3',
            lineupSlots: LineupService.createEmptyLineup('4-3-3'),
            benchSlots: LineupService.createEmptyBench(),
            playerId: 'p1',
            destination: { area: 'unassign', slotId: 'root' },
        });
        expect(result.moved).toBe(false);
    });

    it('blocks moving a player to their current position', () => {
        const roster = [fieldPlayer('p1', 'ST', 70)];
        const lineupSlots = { ...LineupService.createEmptyLineup('4-3-3'), st: 'p1' };
        const benchSlots = LineupService.createEmptyBench();

        const result = LineupService.movePlayer({
            roster,
            formation: '4-3-3',
            lineupSlots,
            benchSlots,
            playerId: 'p1',
            destination: { area: 'pitch', slotId: 'st' },
        });

        expect(result.moved).toBe(false);
    });

    it('blocks swap if the occupying player cannot play in the source slot', () => {
        const roster = [fieldPlayer('st', 'ST', 80), goalkeeper('gk', 80)];
        const lineupSlots = { ...LineupService.createEmptyLineup('4-3-3'), gk: 'gk' };
        const benchSlots = { ...LineupService.createEmptyBench(), 'bench-1': 'st' };

        // Try to move ST to GK slot (this should fail swap because GK can't go to bench-1)
        const result = LineupService.movePlayer({
            roster,
            formation: '4-3-3',
            lineupSlots,
            benchSlots,
            playerId: 'st',
            destination: { area: 'pitch', slotId: 'gk' },
        });

        expect(result.moved).toBe(false);
    });

    it('creates initial assignments even with empty roster or no GK', () => {
        const resultEmpty = LineupService.createInitialAssignments([], '4-3-3');
        expect(resultEmpty.lineupSlots.gk).toBe(null);

        const rosterNoGk = [fieldPlayer('p1', 'ST', 70)];
        const resultNoGk = LineupService.createInitialAssignments(rosterNoGk, '4-3-3');
        expect(resultNoGk.benchSlots['bench-gk']).toBe(null);
    });

    it('returns false if moving a non-existent player', () => {
        const result = LineupService.movePlayer({
            roster: [],
            formation: '4-3-3',
            lineupSlots: LineupService.createEmptyLineup('4-3-3'),
            benchSlots: LineupService.createEmptyBench(),
            playerId: 'ghost',
            destination: { area: 'pitch', slotId: 'st' },
        });
        expect(result.moved).toBe(false);
    });

    it('getPositionEfficiency handles GK bench slots correctly', () => {
        const gk = goalkeeper('gk', 80);
        const st = fieldPlayer('st', 'ST', 80);
        const gkBench = LineupService.getBenchSlots().find(s => s.id === 'bench-gk')!;
        const fieldBench = LineupService.getBenchSlots().find(s => s.id === 'bench-1')!;

        expect(LineupService.getPositionEfficiency(gk, gkBench)).toBe(1.0);
        expect(LineupService.getPositionEfficiency(st, gkBench)).toBe(0.1);
        expect(LineupService.getPositionEfficiency(gk, fieldBench)).toBe(0.1);
        expect(LineupService.getPositionEfficiency(st, fieldBench)).toBe(1.0);
    });

    it('normalizes bench by filtering invalid or duplicate players', () => {
        const gk = goalkeeper('gk', 80);
        const st = fieldPlayer('st', 'ST', 80);
        const roster = [gk, st];
        
        // bench-gk has st, and bench-1 has st (duplicate). bench-gk accepts only GK.
        const benchSlots = {
            'bench-gk': 'st', 
            'bench-1': 'st',
            'bench-2': 'gk' // invalid for FIELD slot
        };

        // @ts-ignore - access private for testing
        const result = LineupService.normalizeBenchAssignments(roster, benchSlots);
        
        expect(result['bench-gk']).toBe(null); // ST cannot be in GK bench
        expect(result['bench-1']).toBe('st'); // Valid
        expect(result['bench-2']).toBe(null); // GK cannot be in FIELD bench
    });

    it('returns moved: false if occupying player or source slot is missing during swap', () => {
        const roster = [fieldPlayer('p1', 'ST', 70), fieldPlayer('p2', 'ST', 75)];
        const lineupSlots = { ...LineupService.createEmptyLineup('4-4-2 DIAMOND'), st: 'p2' };
        const benchSlots = { ...LineupService.createEmptyBench(), 'bench-1': 'p1' };

        // Test with invalid occupying player ID (not in roster)
        const resultInvalidPlayer = LineupService.movePlayer({
            playerId: 'p1',
            destination: { area: 'pitch', slotId: 'st' },
            roster: [fieldPlayer('p1', 'ST', 70)], // p2 missing
            formation: '4-4-2 DIAMOND',
            lineupSlots,
            benchSlots
        });

        expect(resultInvalidPlayer.moved).toBe(false);

        // Test with unassign destination
        const resultUnassign = LineupService.movePlayer({
            playerId: 'p2',
            destination: { area: 'unassign', slotId: 'root' },
            roster,
            formation: '4-4-2 DIAMOND',
            lineupSlots,
            benchSlots
        });

        expect(resultUnassign.moved).toBe(true);
        expect(resultUnassign.lineupSlots.st).toBe(null);
    });
});
