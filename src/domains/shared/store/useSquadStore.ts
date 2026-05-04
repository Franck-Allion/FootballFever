import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player } from '../schemas/EntitySchemas';
import { PlayerFactory } from '../services/PlayerFactory';
import { TeamRatingService } from '../services/TeamRatingService';

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
    
    // Actions
    setTeamName: (name: string) => void;
    setDivision: (division: number) => void;
    setFormation: (formation: string) => void;
    setOverallRating: (rating: number) => void;
    computeOverallRating: () => void;
    initializeRoster: (force?: boolean) => void;
}

export const useSquadStore = create<SquadState>()(
    persist(
        (set) => ({
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
            setTeamName: (teamName) => set({ teamName }),
            setDivision: (division) => set({ division }),
            setFormation: (formation) => set((state) => {
                const rating = TeamRatingService.calculateTeamRating(state.roster, formation);

                return {
                    formation,
                    overallRating: rating.overallRating,
                    composites: rating.composites,
                    staminaAvg: rating.staminaAvg,
                    morale: rating.morale,
                };
            }),
            setOverallRating: (overallRating) => set({ overallRating }),
            computeOverallRating: () => set((state) => {
                const rating = TeamRatingService.calculateTeamRating(state.roster, state.formation);

                return {
                    overallRating: rating.overallRating,
                    composites: rating.composites,
                    staminaAvg: rating.staminaAvg,
                    morale: rating.morale,
                };
            }),
            initializeRoster: (force = false) => set((state) => {
                if (!force && state.roster.length > 0) return state;
                
                const roster = PlayerFactory.getInstance().generateInitialSquad(state.division);
                const rating = TeamRatingService.calculateTeamRating(roster, state.formation);

                return { 
                    roster,
                    overallRating: rating.overallRating,
                    composites: rating.composites,
                    staminaAvg: rating.staminaAvg,
                    morale: rating.morale,
                };
            }),
        }),
        {
            name: 'squad-storage',
        }
    )
);
