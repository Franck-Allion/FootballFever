import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, FieldPlayerStats } from '../schemas/EntitySchemas';
import { PlayerFactory } from '../services/PlayerFactory';

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
            setFormation: (formation) => set({ formation }),
            setOverallRating: (overallRating) => set({ overallRating }),
            initializeRoster: (force = false) => set((state) => {
                if (!force && state.roster.length > 0) return state;
                
                const roster = PlayerFactory.getInstance().generateInitialSquad(state.division);
                
                // Simplified average for field players only to satisfy type checking
                const fieldPlayers = roster.filter(p => p.mainPosition !== 'GK');
                
                const avgField = (stat: keyof FieldPlayerStats) => {
                    const total = fieldPlayers.reduce((acc: number, p: Player) => {
                        const s = p.stats as FieldPlayerStats;
                        return acc + (s[stat] || 0);
                    }, 0);
                    return fieldPlayers.length > 0 ? Math.floor(total / fieldPlayers.length) : 0;
                };

                const shootingAvg = avgField('shooting');
                const passingAvg = avgField('passing');
                const defenseAvg = avgField('tackling'); // Using tackling as proxy for defense
                const physicalAvg = avgField('stamina'); // Using stamina as proxy for physical

                return { 
                    roster,
                    overallRating: shootingAvg, // Temporary
                    composites: {
                        shooting: shootingAvg,
                        passing: passingAvg,
                        defense: defenseAvg,
                        physical: physicalAvg,
                    }
                };
            }),
        }),
        {
            name: 'squad-storage',
        }
    )
);
