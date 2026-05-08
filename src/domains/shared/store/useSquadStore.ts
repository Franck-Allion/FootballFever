import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player } from '../schemas/EntitySchemas';
import { type AssignmentDestination, type AssignmentMap, LineupService } from '../services/LineupService';
import { PlayerFactory } from '../services/PlayerFactory';
import { type TacticalInstructionId } from '../services/TacticalInstructionService';
import { HumanManagementService, type MatchOutcome } from '../services/HumanManagementService';

export interface TimelineNode {
    id: string;
    type: 'match' | 'mercato' | 'boss' | 'rest';
    label: string;
    status: 'completed' | 'current' | 'locked';
    opponent?: string;
    difficulty?: 'EASY' | 'NORMAL' | 'HARD' | 'CRITICAL';
}

export interface ActiveSynergy {
    id: string;
    icon: string;
    label: string;
    description: string;
}

export type MoraleState = 'LOW' | 'STABLE' | 'HIGH' | 'EXCESSIVE';

interface SquadState {
    teamName: string;
    teamLogo: string;
    division: number;
    formation: string;
    overallRating: number;
    composites: {
        attack: number;
        midfield: number;
        shooting: number;
        passing: number;
        defense: number;
        physical: number;
    };
    staminaAvg: number;
    morale: number; // 0-100 as per schema
    streak: string[];
    routeNodes: TimelineNode[];
    activeSynergies: ActiveSynergy[];
    roster: Player[];
    lineupSlots: AssignmentMap;
    benchSlots: AssignmentMap;
    gameInstruction: TacticalInstructionId;
    
    // Actions
    setTeamName: (name: string) => void;
    setDivision: (division: number) => void;
    setFormation: (formation: string) => void;
    setGameInstruction: (instruction: TacticalInstructionId) => void;
    movePlayerToSlot: (playerId: string, destination: AssignmentDestination) => boolean;
    initializeLineup: (force?: boolean) => void;
    setOverallRating: (rating: number) => void;
    computeOverallRating: () => void;
    initializeRoster: (force?: boolean) => void;
    finalizeMatchDay: (result: { homeScore: number; awayScore: number }, homeFinalStamina: number, seed: number) => void;
}

const DEFAULT_FORMATION = '4-4-2 DIAMOND';

const applyRating = (
    roster: Player[],
    formation: string,
    lineupSlots: AssignmentMap
): Pick<SquadState, 'overallRating' | 'composites' | 'staminaAvg' | 'morale'> => {
    const rating = LineupService.calculateAssignedTeamRating(roster, formation, lineupSlots);

    return {
        overallRating: rating.overallRating,
        composites: rating.composites,
        staminaAvg: rating.staminaAvg,
        morale: rating.morale,
    };
};

export const useSquadStore = create<SquadState>()(
    persist(
        (set) => ({
            teamName: 'STRIKER_COMMAND',
            teamLogo: '/assets/logo/logo-1.png',
            division: 4,
            formation: DEFAULT_FORMATION,
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
            streak: ['W', 'D', 'W', 'W', 'L'],
            routeNodes: [
                { id: '1', type: 'match', label: 'Match 1', status: 'completed', opponent: 'Kobal FC', difficulty: 'EASY' },
                { id: '2', type: 'match', label: 'Match 2', status: 'completed', opponent: 'Zenith City', difficulty: 'NORMAL' },
                { id: '3', type: 'mercato', label: 'Draft', status: 'completed' },
                { id: '4', type: 'match', label: 'Match 3', status: 'current', opponent: 'Titan United', difficulty: 'HARD' },
                { id: '5', type: 'rest', label: 'Repos', status: 'locked' },
                { id: '6', type: 'boss', label: 'Final', status: 'locked' },
            ],
            activeSynergies: [
                { id: 's1', icon: 'bolt', label: 'Neon Counters', description: 'Fast breaks deal +15% pressure' },
                { id: 's2', icon: 'shield', label: 'Iron Wall', description: '+10% Def in Final 10m' },
            ],
            roster: [],
            lineupSlots: LineupService.createEmptyLineup(DEFAULT_FORMATION),
            benchSlots: LineupService.createEmptyBench(),
            gameInstruction: 'balanced',
            setTeamName: (teamName) => set({ teamName }),
            setDivision: (division) => set({ division }),
            setFormation: (formation) => set((state) => {
                const assignments = LineupService.remapAssignmentsForFormation({
                    roster: state.roster,
                    fromFormation: state.formation,
                    toFormation: formation,
                    lineupSlots: state.lineupSlots,
                    benchSlots: state.benchSlots,
                });

                return {
                    formation,
                    ...assignments,
                    ...applyRating(state.roster, formation, assignments.lineupSlots),
                };
            }),
            setGameInstruction: (gameInstruction) => set((state) => ({
                gameInstruction,
                ...applyRating(state.roster, state.formation, state.lineupSlots),
            })),
            movePlayerToSlot: (playerId, destination) => {
                let moved = false;

                set((state) => {
                    const result = LineupService.movePlayer({
                        roster: state.roster,
                        formation: state.formation,
                        lineupSlots: state.lineupSlots,
                        benchSlots: state.benchSlots,
                        playerId,
                        destination,
                    });

                    moved = result.moved;
                    if (!result.moved) return state;

                    return {
                        lineupSlots: result.lineupSlots,
                        benchSlots: result.benchSlots,
                        ...applyRating(state.roster, state.formation, result.lineupSlots),
                    };
                });

                return moved;
            },
            initializeLineup: (force = false) => set((state) => {
                const hasAssignments = Object.values(state.lineupSlots).some(Boolean) || Object.values(state.benchSlots).some(Boolean);
                if (!force && hasAssignments) return state;

                const assignments = LineupService.createInitialAssignments(state.roster, state.formation);

                return {
                    ...assignments,
                    ...applyRating(state.roster, state.formation, assignments.lineupSlots),
                };
            }),
            setOverallRating: (overallRating) => set({ overallRating }),
            computeOverallRating: () => set((state) => {
                return {
                    ...applyRating(state.roster, state.formation, state.lineupSlots),
                };
            }),
            initializeRoster: (force = false) => set((state) => {
                if (!force && state.roster.length > 0) return state;
                
                const roster = PlayerFactory.getInstance().generateInitialSquad(state.division);
                const assignments = LineupService.createInitialAssignments(roster, state.formation);

                return { 
                    roster,
                    ...assignments,
                    ...applyRating(roster, state.formation, assignments.lineupSlots),
                };
            }),
            finalizeMatchDay: (result, homeFinalStamina, seed) => set((state) => {
                const outcome: MatchOutcome = result.homeScore > result.awayScore 
                    ? 'win' 
                    : result.homeScore < result.awayScore 
                        ? 'loss' 
                        : 'draw';

                const starters = new Set(Object.values(state.lineupSlots).filter(Boolean) as string[]);

                const evolvedRoster = state.roster.map((player) => {
                    const playedInMatch = starters.has(player.id);

                    if (playedInMatch) {
                        return HumanManagementService.evolvePlayerAfterMatch(player, {
                            outcome,
                            playedInMatch: true,
                            finalStamina: homeFinalStamina,
                            seed
                        });
                    } else {
                        // Bench or squad players recover
                        return HumanManagementService.applyRestRecovery(player);
                    }
                });

                return {
                    roster: evolvedRoster,
                    streak: [...state.streak.slice(1), outcome === 'win' ? 'W' : outcome === 'loss' ? 'L' : 'D'],
                    ...applyRating(evolvedRoster, state.formation, state.lineupSlots),
                };
            }),

        }),
        {
            name: 'squad-storage',
            version: 2,
            merge: (persisted, current) => {
                const saved = persisted as Partial<SquadState> | null;
                if (!saved) return current;

                return {
                    ...current,
                    ...saved,
                    composites: {
                        ...current.composites,
                        ...saved.composites,
                    },
                    lineupSlots: saved.lineupSlots ?? current.lineupSlots,
                    benchSlots: saved.benchSlots ?? current.benchSlots,
                    gameInstruction: saved.gameInstruction ?? current.gameInstruction,
                };
            },
        }
    )
);
