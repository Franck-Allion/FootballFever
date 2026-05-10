import { describe, expect, it, vi } from 'vitest';
import { CommandBus } from './CommandBus';
import { RESET_GAME_COMMAND, handleResetGame } from './ResetGameCommand';
import { DatabaseService } from '@core/services/database/DatabaseService';
import { useSquadStore } from '@domains/shared/store/useSquadStore';
import { useEconomyStore } from '@core/store/useEconomyStore';
import { useMatchLogStore } from '@domains/match/store/useMatchLogStore';
import { FlowService } from '@core/fsm/FlowService';
import { GameState } from '@core/fsm/GameState';

// Setup shared mock objects
const mockDb = {
    clearAll: vi.fn().mockResolvedValue(undefined),
};
const mockSquad = {
    initializeRoster: vi.fn(),
};
const mockEconomy = {
    reset: vi.fn(),
};
const mockMatchLogs = {
    clearLogs: vi.fn(),
};
const mockFlow = {
    navigateTo: vi.fn(),
};

// Mock everything
vi.mock('@core/services/database/DatabaseService', () => ({
    DatabaseService: {
        getInstance: () => mockDb,
    },
}));

vi.mock('@domains/shared/store/useSquadStore', () => ({
    useSquadStore: {
        getState: () => mockSquad,
    },
}));

vi.mock('@core/store/useEconomyStore', () => ({
    useEconomyStore: {
        getState: () => mockEconomy,
    },
}));

vi.mock('@domains/match/store/useMatchLogStore', () => ({
    useMatchLogStore: {
        getState: () => mockMatchLogs,
    },
}));

vi.mock('@core/fsm/FlowService', () => ({
    FlowService: {
        getInstance: () => mockFlow,
    },
}));

describe('ResetGameCommand', () => {
    it('registers the handler automatically on import', () => {
        const bus = CommandBus.getInstance();
        const consoleSpy = vi.spyOn(console, 'error');
        bus.dispatch({ type: RESET_GAME_COMMAND });
        expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('No handler registered'));
    });

    it('clears all data and navigates to Hub when handled', async () => {
        await handleResetGame({ type: RESET_GAME_COMMAND });

        expect(mockDb.clearAll).toHaveBeenCalled();
        expect(mockSquad.initializeRoster).toHaveBeenCalledWith(true);
        expect(mockEconomy.reset).toHaveBeenCalled();
        expect(mockMatchLogs.clearLogs).toHaveBeenCalled();
        expect(mockFlow.navigateTo).toHaveBeenCalledWith(GameState.HUB);
    });
});
