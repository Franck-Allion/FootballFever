import { create } from 'zustand';
import { Player } from '../schemas/EntitySchemas';

export interface TimelineNode {
    id: string;
    type: 'match' | 'mercato' | 'boss' | 'rest';
    label: string;
    status: 'completed' | 'current' | 'locked';
    opponent?: string;
    difficulty?: 'EASY' | 'NORMAL' | 'HARD' | 'CRITICAL';
    result?: 'W' | 'L' | 'D';
}

export interface TeamComposites {
    shooting: number;
    control: number;
    defense: number;
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
    composites: TeamComposites;
    staminaAvg: number;
    morale: MoraleState;
    streak: string[];
    routeNodes: TimelineNode[];
    activeSynergies: ActiveSynergy[];
    roster: Player[];
    
    // Actions
    setTeamName: (name: string) => void;
    setDivision: (division: number) => void;
    setFormation: (formation: string) => void;
    setOverallRating: (rating: number) => void;
}

export const useSquadStore = create<SquadState>((set) => ({
    teamName: 'STRIKER_COMMAND',
    teamLogo: '/assets/logo/logo-1.png',
    division: 4,
    formation: '4-4-2 DIAMOND',
    overallRating: 84,
    composites: {
        shooting: 78,
        control: 82,
        defense: 72
    },
    staminaAvg: 68,
    morale: 'EXCESSIVE',
    streak: ['W', 'W', 'W', 'L', 'W'],
    routeNodes: [
        { id: '1', type: 'match', label: 'Match 12', status: 'completed', opponent: 'NEON_CITY', result: 'W' },
        { id: '2', type: 'match', label: 'Match 13', status: 'completed', opponent: 'CYBER_UNITED', result: 'W' },
        { id: '3', type: 'match', label: 'Match 14', status: 'current', opponent: 'VOID_TITANS', difficulty: 'HARD' },
        { id: '4', type: 'mercato', label: 'Mercato Draft', status: 'locked' },
        { id: '5', type: 'match', label: 'Match 15', status: 'locked', opponent: 'ZENITH_FC', difficulty: 'NORMAL' },
        { id: '6', type: 'boss', label: 'Division Final', status: 'locked', opponent: 'THE_GOLIATH', difficulty: 'CRITICAL' },
    ],
    activeSynergies: [
        { id: 's1', icon: 'bolt', label: 'Lightning Strike', description: '+15% Pace on Counters' },
        { id: 's2', icon: 'shield', label: 'Iron Wall', description: '+10% Def in Final 10m' },
    ],
    roster: [],
    setTeamName: (teamName) => set({ teamName }),
    setDivision: (division) => set({ division }),
    setFormation: (formation) => set({ formation }),
    setOverallRating: (overallRating) => set({ overallRating }),
}));
