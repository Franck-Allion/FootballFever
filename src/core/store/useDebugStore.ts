import { create } from 'zustand';
import { LogEntry } from '../services/logger/LoggerService';

interface DebugState {
    isVisible: boolean;
    logs: LogEntry[];
    toggleVisibility: () => void;
    addLog: (log: LogEntry) => void;
    clearLogs: () => void;
}

const MAX_LOGS = 50;

export const useDebugStore = create<DebugState>((set) => ({
    isVisible: false,
    logs: [],
    toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
    addLog: (log) => set((state) => ({
        logs: [log, ...state.logs].slice(0, MAX_LOGS)
    })),
    clearLogs: () => set({ logs: [] }),
}));
