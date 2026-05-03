import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PersistenceService } from './PersistenceService';
import { useFlowStore } from '@core/store/useFlowStore';
import { useEconomyStore } from '@core/store/useEconomyStore';
import { DatabaseService } from '@core/services/database/DatabaseService';
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';
import { GameState } from '@core/fsm/GameState';

describe('PersistenceService', () => {
    let service: PersistenceService;
    let dbService: DatabaseService;

    beforeEach(async () => {
        useFlowStore.getState().setGameState(GameState.BOOT);
        useFlowStore.getState().setPersistenceNotice(null);
        useEconomyStore.getState().setPrestige(0);

        DatabaseService.resetInstanceForTests();
        dbService = DatabaseService.getInstance({ indexedDB, IDBKeyRange });
        await dbService.clearAll();

        PersistenceService.resetInstanceForTests();
        service = PersistenceService.getInstance();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize and subscribe to stores', () => {
        const triggerSaveSpy = vi.spyOn(service, 'triggerSave');
        service.init();

        useEconomyStore.getState().setPrestige(100);

        expect(triggerSaveSpy).toHaveBeenCalled();
    });

    it('should save game state to database', async () => {
        service.init();
        useEconomyStore.getState().setPrestige(500);
        useFlowStore.getState().setGameState(GameState.HUB);

        await service.triggerSave();

        const saved = await dbService.loadGlobalState();
        expect(saved).toBeDefined();
        expect(saved?.prestige).toBe(500);
        expect(saved?.currentState).toBe(GameState.HUB);
    });

    it('should load persisted state into stores', async () => {
        const stateData = {
            id: 'current_session',
            currentState: GameState.MATCH_SIM,
            prestige: 1500,
            lastSaved: new Date().toISOString()
        };
        await dbService.saveGlobalState(stateData);

        await service.loadPersistedState();

        expect(useEconomyStore.getState().prestige).toBe(1500);
        expect(useFlowStore.getState().currentState).toBe(GameState.MATCH_SIM);
    });

    it('should handle database errors gracefully during save', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(dbService, 'saveGlobalState').mockRejectedValue(new Error('DB Error'));

        await service.triggerSave();

        expect(consoleSpy).toHaveBeenCalledWith('Failed to auto-save game state:', expect.any(Error));
    });

    it('should reset persisted state and set recovery notice on corrupted load', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(dbService, 'loadGlobalState').mockRejectedValue(new Error('Corrupted'));

        useFlowStore.getState().setGameState(GameState.HUB);
        useEconomyStore.getState().setPrestige(222);

        await service.loadPersistedState();

        expect(consoleSpy).toHaveBeenCalledWith('Failed to load persisted game state:', expect.any(Error));
        expect(useFlowStore.getState().currentState).toBe(GameState.BOOT);
        expect(useEconomyStore.getState().prestige).toBe(0);
        expect(useFlowStore.getState().persistenceNotice).toBe('common.persistence_recovered');
    });
});
