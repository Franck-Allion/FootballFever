import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState } from '../fsm/GameState';

interface FlowState {
    currentState: GameState;
    error: string | null;
    setGameState: (state: GameState) => void;
    setError: (error: string | null) => void;
}

export const useFlowStore = create<FlowState>()(
    persist(
        (set) => ({
            currentState: GameState.BOOT,
            error: null,
            setGameState: (state) => set({ currentState: state, error: null }),
            setError: (error) => set({ error }),
        }),
        {
            name: 'football-fever-flow-storage',
        }
    )
);
