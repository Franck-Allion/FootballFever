import { GameState } from './GameState';

export interface TransitionGuard {
    canTransition(to: GameState): boolean | Promise<boolean>;
    errorMessage?: string;
}

export class FlowController {
    private currentState: GameState = GameState.BOOT;
    private guards: Map<GameState, TransitionGuard[]> = new Map();
    private onStateChange: ((state: GameState) => void) | null = null;

    constructor(initialState: GameState = GameState.BOOT) {
        this.currentState = initialState;
    }

    public getCurrentState(): GameState {
        return this.currentState;
    }

    public registerGuard(targetState: GameState, guard: TransitionGuard): void {
        const stateGuards = this.guards.get(targetState) || [];
        stateGuards.push(guard);
        this.guards.set(targetState, stateGuards);
    }

    public setOnStateChange(callback: (state: GameState) => void): void {
        this.onStateChange = callback;
    }

    public async transitionTo(targetState: GameState): Promise<{ success: boolean; error?: string }> {
        if (targetState === this.currentState) {
            return { success: true };
        }

        const stateGuards = this.guards.get(targetState) || [];
        for (const guard of stateGuards) {
            const canTransition = await guard.canTransition(targetState);
            if (!canTransition) {
                return { 
                    success: false, 
                    error: guard.errorMessage || `Transition to ${targetState} blocked by guard.` 
                };
            }
        }

        this.currentState = targetState;
        
        if (this.onStateChange) {
            this.onStateChange(this.currentState);
        }

        return { success: true };
    }
}
