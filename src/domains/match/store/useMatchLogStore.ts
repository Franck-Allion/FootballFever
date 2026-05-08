import { create } from 'zustand';

export interface MatchLogEntry {
    id: string;
    minute: number;
    second: number;
    text: string; // This will now be a translation key
    params?: (string | number)[];
    type: 'EVENT' | 'GOAL' | 'CARD' | 'WHISTLE' | 'SYSTEM';
    intensity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface MatchLogState {
    logs: MatchLogEntry[];
    currentTime: { min: number; sec: number };
    homeScore: number;
    awayScore: number;
    matchId: string | null;
    seed: number | null;
    isPaused: boolean;
    isHalfTime: boolean;
    isFinished: boolean;
    finalStamina: { home: number; away: number };
    addLog: (entry: MatchLogEntry) => void;
    clearLogs: () => void;
    setPaused: (paused: boolean) => void;
    setHalfTime: (halfTime: boolean) => void;
    setFinished: (finished: boolean) => void;
    setCurrentTime: (min: number, sec: number) => void;
    setScores: (home: number, away: number) => void;
    setMatchMetadata: (id: string, seed: number) => void;
    setFinalStamina: (home: number, away: number) => void;
}

export const useMatchLogStore = create<MatchLogState>((set) => ({
    logs: [],
    currentTime: { min: 0, sec: 0 },
    homeScore: 0,
    awayScore: 0,
    matchId: null,
    seed: null,
    isPaused: false,
    isHalfTime: false,
    isFinished: false,
    finalStamina: { home: 100, away: 100 },
    addLog: (entry) => set((state) => {
        // Performance: Use a capped log size if needed, but for now just optimize addition
        const newLogs = [entry, ...state.logs];
        return { logs: newLogs };
    }),
    clearLogs: () => set({ 
        logs: [], 
        currentTime: { min: 0, sec: 0 }, 
        homeScore: 0, 
        awayScore: 0, 
        isPaused: false, 
        isHalfTime: false, 
        isFinished: false,
        finalStamina: { home: 100, away: 100 }
    }),
    setPaused: (isPaused) => set({ isPaused }),
    setHalfTime: (isHalfTime) => set({ isHalfTime }),
    setFinished: (isFinished) => set({ isFinished }),
    setCurrentTime: (min, sec) => set({ currentTime: { min, sec } }),
    setScores: (homeScore, awayScore) => set({ homeScore, awayScore }),
    setMatchMetadata: (matchId, seed) => set({ matchId, seed }),
    setFinalStamina: (home, away) => set({ finalStamina: { home, away } }),
}));
