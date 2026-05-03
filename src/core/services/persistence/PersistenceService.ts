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
    private unsubscribers: Array<() => void> = [];
    private saveTimeout: ReturnType<typeof setTimeout> | null = null;
    private readonly DEBOUNCE_DELAY = 1000; // ms
    private isHydrating: boolean = false;
    private saveQueue: Promise<void> = Promise.resolve();

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

        // Subscribe to store changes with debounce
        const unsubFlow = useFlowStore.subscribe((state, prevState) => {
            // Only trigger if state actually changed (not during hydration)
            if (!this.isHydrating && (state.currentState !== prevState.currentState || state.persistenceNotice !== prevState.persistenceNotice)) {
                this.scheduleSave();
            }
        });

        const unsubEconomy = useEconomyStore.subscribe((state, prevState) => {
            if (!this.isHydrating && state.prestige !== prevState.prestige) {
                this.scheduleSave();
            }
        });

        this.unsubscribers.push(unsubFlow, unsubEconomy);
        this.isInitialized = true;
    }

    public destroy(): void {
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }
        this.isInitialized = false;
    }

    private scheduleSave(): void {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
            this.triggerSave();
        }, this.DEBOUNCE_DELAY);
    }

    public async triggerSave(): Promise<void> {
        // Enqueue the save to prevent overlapping writes
        this.saveQueue = this.saveQueue.then(async () => {
            const flowState = useFlowStore.getState();
            const economyState = useEconomyStore.getState();

            const stateData: GameStateData = {
                id: 'current_session',
                currentState: flowState.currentState,
                currentDivision: 1, // Default for now until we have division state
                prestige: economyState.prestige,
                lastSaved: new Date().toISOString()
            };

            try {
                await this.dbService.saveGlobalState(stateData);
            } catch (error) {
                console.error('Failed to auto-save game state:', error);
            }
        });

        return this.saveQueue;
    }

    public async loadPersistedState(): Promise<void> {
        try {
            const savedState = await this.dbService.loadGlobalState();
            if (savedState) {
                this.isHydrating = true;
                useFlowStore.getState().setPersistenceNotice(null);
                const nextState = this.toGameStateOrDefault(savedState.currentState);
                
                // Set state without triggering a new save immediately
                useFlowStore.setState({ currentState: nextState });
                useEconomyStore.setState({ prestige: savedState.prestige });
                this.isHydrating = false;
            }
        } catch (error) {
            this.isHydrating = false;
            console.error('Failed to load persisted game state:', error);
            await this.handleCorruptedState();
        }
    }

    private toGameStateOrDefault(rawState: string): GameState {
        if ((Object.values(GameState) as string[]).includes(rawState)) {
            return rawState as GameState;
        }

        return GameState.BOOT;
    }

    private async handleCorruptedState(): Promise<void> {
        // Surgical recovery: we only reset the problematic global state, not everything.
        // We could ask for consent here if we had a proper UI bridge for blocking decisions.
        // For now, we follow AC 5's spirit by just notifying the user.
        
        try {
            this.isHydrating = true;
            // Attempt to reset just the global state table
            // We don't wipe players/teams unless they are also corrupted (checked during loadAll)
            useFlowStore.getState().setGameState(GameState.BOOT);
            useEconomyStore.getState().setPrestige(0);
            useFlowStore.getState().setPersistenceNotice('common.persistence_recovered');
            this.isHydrating = false;
            this.triggerSave(); // Ensure we save the reset state
        } catch (e) {
            this.isHydrating = false;
            console.error('PersistenceService: Critical failure during recovery', e);
        }
    }
}
