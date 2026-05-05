import { beforeEach, describe, expect, it } from 'vitest';

import { EntityFactory } from '../factories/EntityFactory';
import { PlayerSchema, type GoalkeeperStats, type Player } from '../schemas/EntitySchemas';
import { LineupService } from '../services/LineupService';
import { useSquadStore } from './useSquadStore';

const createPlayer = (id: string, position: Player['mainPosition'], base: number): Player => EntityFactory.createPlayer({
    id,
    name: id,
    mainPosition: position,
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
    },
});

const createGoalkeeper = (id: string, base: number): Player => PlayerSchema.parse({
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

describe('useSquadStore team rating integration', () => {
    beforeEach(() => {
        localStorage.clear();
        EntityFactory.resetCounters();
        useSquadStore.setState({
            formation: '4-4-2 DIAMOND',
            overallRating: 0,
            composites: {
                attack: 0,
                midfield: 0,
                shooting: 0,
                passing: 0,
                defense: 0,
                physical: 0,
            },
            staminaAvg: 100,
            morale: 50,
            roster: [],
            lineupSlots: LineupService.createEmptyLineup('4-4-2 DIAMOND'),
            benchSlots: LineupService.createEmptyBench(),
            gameInstruction: 'balanced',
        });
    });

    it('updates overall, composites, morale, and stamina from the active formation', () => {
        // Arrange
        const roster = [
            createGoalkeeper('gk', 65),
            createPlayer('lb', 'LB', 60),
            createPlayer('cb-1', 'CB', 61),
            createPlayer('cb-2', 'CB', 62),
            createPlayer('rb', 'RB', 63),
            createPlayer('cdm', 'CDM', 64),
            createPlayer('cm-1', 'CM', 65),
            createPlayer('cm-2', 'CM', 66),
            createPlayer('cam', 'CAM', 67),
            createPlayer('st-1', 'ST', 80),
            createPlayer('st-2', 'ST', 82),
        ];

        useSquadStore.setState({ roster });

        // Act
        useSquadStore.getState().computeOverallRating();
        const state = useSquadStore.getState();

        // Assert
        expect(state.overallRating).toBeGreaterThan(0);
        expect(state.composites.attack).toBeGreaterThan(state.composites.defense);
        expect(state.composites.midfield).toBeGreaterThan(0);
        expect(state.staminaAvg).toBeGreaterThan(0);
        expect(state.morale).toBeGreaterThan(0);
    });

    it('persists explicit lineup assignments and recomputes rating after a valid move', () => {
        // Arrange
        const roster = [
            createGoalkeeper('gk', 65),
            createPlayer('weak-st', 'ST', 45),
            createPlayer('strong-st', 'ST', 90),
        ];
        useSquadStore.setState({
            roster,
            lineupSlots: {
                ...LineupService.createEmptyLineup('4-4-2 DIAMOND'),
                gk: 'gk',
                'st-l': 'weak-st',
            },
            benchSlots: {
                ...LineupService.createEmptyBench(),
                'bench-1': 'strong-st',
            },
        });
        useSquadStore.getState().computeOverallRating();
        const ratingBefore = useSquadStore.getState().overallRating;

        // Act
        const moved = useSquadStore.getState().movePlayerToSlot('strong-st', { area: 'pitch', slotId: 'st-l' });
        const state = useSquadStore.getState();

        // Assert
        expect(moved).toBe(true);
        expect(state.lineupSlots['st-l']).toBe('strong-st');
        expect(state.benchSlots['bench-1']).toBe('weak-st');
        expect(state.overallRating).toBeGreaterThan(ratingBefore);
    });

    it('preserves manual starters when changing formation instead of resetting to auto-selection', () => {
        // Arrange
        const roster = [
            createGoalkeeper('gk', 65),
            createPlayer('manual-st', 'ST', 45),
            createPlayer('auto-st', 'ST', 90),
        ];
        useSquadStore.setState({
            formation: '4-4-2 DIAMOND',
            roster,
            lineupSlots: {
                ...LineupService.createEmptyLineup('4-4-2 DIAMOND'),
                gk: 'gk',
                'st-l': 'manual-st',
            },
            benchSlots: LineupService.createEmptyBench(),
        });

        // Act
        useSquadStore.getState().setFormation('4-3-3');
        const state = useSquadStore.getState();

        // Assert
        expect(state.formation).toBe('4-3-3');
        expect(Object.values(state.lineupSlots)).toContain('manual-st');
        expect(Object.values(state.lineupSlots)).not.toContain('auto-st');
    });
});
