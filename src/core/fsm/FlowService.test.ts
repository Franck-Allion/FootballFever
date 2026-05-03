import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from './GameState';
import { FlowService } from './FlowService';
import { useFlowStore } from '../store/useFlowStore';

describe('FlowService', () => {
    beforeEach(() => {
        useFlowStore.getState().setGameState(GameState.BOOT);
        useFlowStore.getState().setError(null);
        FlowService.resetInstance();
    });

    it('should navigate and update store', async () => {
        const service = FlowService.getInstance();
        await service.navigateTo(GameState.HUB);
        expect(useFlowStore.getState().currentState).toBe(GameState.HUB);
    });

    it('should set error in store if transition is blocked', async () => {
        const service = FlowService.getInstance();
        service.getController().registerGuard(GameState.MATCH_SIM, {
            canTransition: () => false,
            errorMessage: 'Lineup invalid'
        });

        await service.navigateTo(GameState.MATCH_SIM);
        expect(useFlowStore.getState().currentState).not.toBe(GameState.MATCH_SIM);
        expect(useFlowStore.getState().error).toBe('Lineup invalid');
    });
});
