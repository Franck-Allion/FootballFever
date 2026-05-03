import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../fsm/GameState';
import { FlowController } from '../fsm/FlowController';
import { useFlowStore } from './useFlowStore';

describe('Flow Integration (Controller + Store)', () => {
    let flowController: FlowController;

    beforeEach(() => {
        // Reset store state manually if needed, but for now we'll just check transitions
        useFlowStore.getState().setGameState(GameState.BOOT);
        flowController = new FlowController(GameState.BOOT);
        
        // Link controller to store
        flowController.setOnStateChange((state) => {
            useFlowStore.getState().setGameState(state);
        });
    });

    it('should update Zustand store when transition is successful', async () => {
        await flowController.transitionTo(GameState.HUB);
        expect(useFlowStore.getState().currentState).toBe(GameState.HUB);
    });

    it('should not update Zustand store when transition is blocked', async () => {
        flowController.registerGuard(GameState.MATCH_SIM, {
            canTransition: () => false
        });

        await flowController.transitionTo(GameState.MATCH_SIM);
        expect(useFlowStore.getState().currentState).toBe(GameState.BOOT);
    });
});
