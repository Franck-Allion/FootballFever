import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EconomyState {
    prestige: number;
    addPrestige: (amount: number) => void;
    setPrestige: (amount: number) => void;
}

export const useEconomyStore = create<EconomyState>()(
    (set) => ({
        prestige: 0,
        addPrestige: (amount) => set((state) => ({ prestige: state.prestige + amount })),
        setPrestige: (prestige) => set({ prestige }),
    })
);

