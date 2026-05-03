import { useFlowStore } from '@core/store/useFlowStore';
import { useEconomyStore } from '@core/store/useEconomyStore';
import { DatabaseService } from '@core/services/database/DatabaseService';
// eslint-disable-next-line no-restricted-imports -- Story 2.1 persistence contract uses shared schema types.
import { GameStateData } from '@domains/shared/schemas/EntitySchemas';
import { GameState } from '@core/fsm/GameState';

export class PersistenceService {
    private static instance: PersistenceService | null = null;
    private dbService: DatabaseService;
    private isInitialized: boolean = false;

    private constructor() {
        this.dbService = DatabaseService.getInstance();
    }

    public static getInstance(): PersistenceService {
        if (!PersistenceService.instance) {
            PersistenceService.instance = new PersistenceService();
        }
        return PersistenceService.instance;
    }

    public static resetInstanceForTests(): void {
        PersistenceService.instance = null;
    }

    public init(): void {
        if (this.isInitialized) return;

        // Subscribe to store changes
        useFlowStore.subscribe(() => {
            this.triggerSave();
        });

        useEconomyStore.subscribe(() => {
            this.triggerSave();
        });

        this.isInitialized = true;
    }

    public async triggerSave(): Promise<void> {
        const flowState = useFlowStore.getState();
        const economyState = useEconomyStore.getState();

        const stateData: GameStateData = {
            id: 'current_session',
            currentState: flowState.currentState,
            prestige: economyState.prestige,
            lastSaved: new Date().toISOString()
        };

        try {
            await this.dbService.saveGlobalState(stateData);
        } catch (error) {
            console.error('Failed to auto-save game state:', error);
        }
    }

    public async loadPersistedState(): Promise<void> {
        try {
            const savedState = await this.dbService.loadGlobalState();
            if (savedState) {
                useFlowStore.getState().setPersistenceNotice(null);
                const nextState = this.toGameStateOrDefault(savedState.currentState);
                useFlowStore.getState().setGameState(nextState);
                useEconomyStore.getState().setPrestige(savedState.prestige);
            }
        } catch (error) {
            console.error('Failed to load persisted game state:', error);
            await this.recoverFromCorruptedState();
        }
    }

    private toGameStateOrDefault(rawState: string): GameState {
        if ((Object.values(GameState) as string[]).includes(rawState)) {
            return rawState as GameState;
        }

        return GameState.BOOT;
    }

    private async recoverFromCorruptedState(): Promise<void> {
        await this.dbService.clearAll();
        useFlowStore.getState().setGameState(GameState.BOOT);
        useEconomyStore.getState().setPrestige(0);
        useFlowStore.getState().setPersistenceNotice('common.persistence_recovered');
    }
}
