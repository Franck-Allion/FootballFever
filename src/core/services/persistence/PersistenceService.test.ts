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
        useFlowStore.setState({ currentState: GameState.BOOT, persistenceNotice: null });
        useEconomyStore.setState({ prestige: 0 });

        DatabaseService.resetInstanceForTests();
        dbService = DatabaseService.getInstance({ indexedDB, IDBKeyRange });
        await dbService.clearAll();

        PersistenceService.resetInstanceForTests();
        service = PersistenceService.getInstance();
    });

    afterEach(() => {
        service.destroy();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should initialize and subscribe to stores with debounce', async () => {
        vi.useFakeTimers();
        const triggerSaveSpy = vi.spyOn(service, 'triggerSave');
        service.init();

        useEconomyStore.getState().setPrestige(100);
        
        // Should not be called immediately due to debounce
        expect(triggerSaveSpy).not.toHaveBeenCalled();

        vi.runAllTimers();

        expect(triggerSaveSpy).toHaveBeenCalled();
    });

    it('should save game state to database', async () => {
        service.init();
        useEconomyStore.getState().setPrestige(500);
        useFlowStore.getState().setGameState(GameState.HUB);

        // Manually call triggerSave to bypass debounce/timers for simplicity in this test
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
            currentDivision: 1,
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

        useFlowStore.setState({ currentState: GameState.HUB });
        useEconomyStore.setState({ prestige: 222 });

        await service.loadPersistedState();

        expect(consoleSpy).toHaveBeenCalledWith('Failed to load persisted game state:', expect.any(Error));
        expect(useFlowStore.getState().currentState).toBe(GameState.BOOT);
        expect(useEconomyStore.getState().prestige).toBe(0);
        expect(useFlowStore.getState().persistenceNotice).toBe('common.persistence_recovered');
    });

    it('should handle critical failure during recovery', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(dbService, 'loadGlobalState').mockRejectedValue(new Error('Corrupted'));

        // Mock setGameState to throw error during recovery
        const originalSetState = useFlowStore.setState;
        vi.spyOn(useFlowStore, 'setState').mockImplementation(() => {
            throw new Error('Critical store error');
        });

        // Ensure we cause a failure inside the try block of handleCorruptedState
        // By spying on useFlowStore.getState
        vi.spyOn(useFlowStore, 'getState').mockReturnValue({
            setGameState: () => { throw new Error('Critical store error'); }
        } as any);

        await service.loadPersistedState();

        expect(consoleSpy).toHaveBeenCalledWith('PersistenceService: Critical failure during recovery', expect.any(Error));
    });
});
