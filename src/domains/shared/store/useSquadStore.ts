import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Player, type TimelineNode, type ActiveSynergy } from '../schemas/EntitySchemas';
import { type AssignmentDestination, type AssignmentMap, LineupService } from '../services/LineupService';
import { PlayerFactory } from '../services/PlayerFactory';
import { type TacticalInstructionId } from '../services/TacticalInstructionService';
import { HumanManagementService, type MatchOutcome } from '../services/HumanManagementService';
import { SeasonCalendarService } from '../services/SeasonCalendarService';

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
            streak: [],
            routeNodes: SeasonCalendarService.generateInitialCalendar(),
            activeSynergies: [],
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
                    streak: [],
                    routeNodes: SeasonCalendarService.generateInitialCalendar(),
                    activeSynergies: [],
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
                    streak: [...state.streak, outcome === 'win' ? 'W' : outcome === 'loss' ? 'L' : 'D'].slice(-5),
                    ...applyRating(evolvedRoster, state.formation, state.lineupSlots),
                };
            }),

        }),
        {
            name: 'squad-storage',
            version: 3,
            migrate: (persistedState, version) => {
                const state = persistedState as SquadState;
                
                if (version < 3) {
                    // Sanitize demo data from older versions
                    state.streak = [];
                    state.activeSynergies = [];
                    state.routeNodes = SeasonCalendarService.generateInitialCalendar();
                }

                return state;
            },
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
