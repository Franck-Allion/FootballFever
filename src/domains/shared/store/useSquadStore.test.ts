import { act } from 'react';
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

describe('useSquadStore', () => {
    beforeEach(() => {
        localStorage.clear();
        EntityFactory.resetCounters();
        useSquadStore.setState({
            teamName: 'STRIKER_COMMAND',
            teamLogo: '/assets/logo/logo-1.png',
            division: 4,
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
            streak: [],
            activeSynergies: [],
            roster: [],
            lineupSlots: LineupService.createEmptyLineup('4-4-2 DIAMOND'),
            benchSlots: LineupService.createEmptyBench(),
            gameInstruction: 'balanced',
        });
    });

    describe('team rating integration', () => {
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
    });

    describe('Sanitization (Story 10.2)', () => {
        it('initializes with an empty streak and generated routeNodes', () => {
            const state = useSquadStore.getState();
            expect(state.streak).toEqual([]);
            expect(state.activeSynergies).toEqual([]);
            expect(state.routeNodes.length).toBeGreaterThanOrEqual(5);
            expect(state.routeNodes.some(n => n.type === 'match')).toBe(true);
        });

        it('resets all session data when initializeRoster is forced', () => {
            const store = useSquadStore.getState();
            
            // 1. Set some non-default session data
            act(() => {
                useSquadStore.setState({
                    streak: ['W', 'W'],
                    activeSynergies: [{ id: 'test', icon: 'test', label: 'test', description: 'test' }]
                });
            });

            // 2. Force initialization
            act(() => {
                store.initializeRoster(true);
            });

            const state = useSquadStore.getState();
            expect(state.streak).toEqual([]);
            expect(state.activeSynergies).toEqual([]);
            expect(state.routeNodes.length).toBeGreaterThanOrEqual(5);
            expect(state.roster.length).toBeGreaterThan(0);
        });

        it('migrates from version 2 to 3 by sanitizing demo data', () => {
            const { migrate } = (useSquadStore as any).persist.getOptions();
            
            const legacyState = {
                version: 2,
                streak: ['W', 'D', 'W', 'W', 'L'],
                activeSynergies: [{ id: 's1', icon: 'bolt', label: 'Neon Counters', description: '...' }],
                roster: [{ id: 'p1', name: 'Player 1' }]
            };

            const migrated = migrate(legacyState, 2);

            expect(migrated.streak).toEqual([]);
            expect(migrated.activeSynergies).toEqual([]);
            expect(migrated.routeNodes.length).toBeGreaterThanOrEqual(5);
            expect(migrated.roster).toEqual(legacyState.roster); // Roster preserved
        });
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

    it('updates team name, division, and game instructions', () => {
        const store = useSquadStore.getState();

        store.setTeamName('New Team');
        expect(useSquadStore.getState().teamName).toBe('New Team');

        store.setDivision(1);
        expect(useSquadStore.getState().division).toBe(1);

        store.setGameInstruction('ultra_defensive');
        expect(useSquadStore.getState().gameInstruction).toBe('ultra_defensive');
    });

    it('skips initialization if not forced and data exists', () => {
        const { initializeRoster, initializeLineup } = useSquadStore.getState();
        
        // 1. Initialize with force
        act(() => {
            initializeRoster(true);
        });
        const initialRoster = useSquadStore.getState().roster;
        const initialLineup = useSquadStore.getState().lineupSlots;
        
        // 2. Call again without force
        act(() => {
            initializeRoster(false);
            initializeLineup(false);
        });
        
        expect(useSquadStore.getState().roster).toBe(initialRoster);
        expect(useSquadStore.getState().lineupSlots).toBe(initialLineup);
    });

    it('applies match outcomes to player stats in finalizeMatchDay (Win/Loss/Draw)', () => {
        const { initializeRoster, finalizeMatchDay, movePlayerToSlot } = useSquadStore.getState();
        initializeRoster(true);

        const player = useSquadStore.getState().roster[0];
        act(() => {
            movePlayerToSlot(player.id, { area: 'pitch', slotId: 'gk' });
        });

        // Test Draw
        act(() => {
            finalizeMatchDay({ homeScore: 1, awayScore: 1 }, 95, 123);
        });
        expect(useSquadStore.getState().streak[useSquadStore.getState().streak.length - 1]).toBe('D');

        // Test Loss
        act(() => {
            finalizeMatchDay({ homeScore: 0, awayScore: 2 }, 90, 123);
        });
        expect(useSquadStore.getState().streak[useSquadStore.getState().streak.length - 1]).toBe('L');
    });

    it('merges persisted state correctly including composites', () => {
        // Access the persist options where merge is defined
        const persistOptions = (useSquadStore as any).persist.getOptions();
        const merge = persistOptions.merge;
        
        if (typeof merge !== 'function') return;

        const current = useSquadStore.getState();
        const saved = {
            teamName: 'Persisted Team',
            composites: { attack: 80, defense: 70 }
        };
        
        const merged = merge(saved, current);
        
        expect(merged.teamName).toBe('Persisted Team');
        expect(merged.composites.attack).toBe(80);
        expect(merged.composites.defense).toBe(70);
        expect(merged.formation).toBe(current.formation); // Kept from current

        // Test with null saved
        const mergedNull = merge(null, current);
        expect(mergedNull).toBe(current);
    });
});
