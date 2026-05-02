import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from './GameState';
import { FlowController, TransitionGuard } from './FlowController';

describe('FlowController', () => {
    let flowController: FlowController;

    beforeEach(() => {
        flowController = new FlowController(GameState.BOOT);
    });

    it('should start at BOOT state', () => {
        expect(flowController.getCurrentState()).toBe(GameState.BOOT);
    });

    it('should transition to HUB state', async () => {
        const result = await flowController.transitionTo(GameState.HUB);
        expect(result.success).toBe(true);
        expect(flowController.getCurrentState()).toBe(GameState.HUB);
    });

    it('should block transition if guard fails', async () => {
        const failingGuard: TransitionGuard = {
            canTransition: () => false,
            errorMessage: 'Lineup invalid'
        };

        flowController.registerGuard(GameState.MATCH_SIM, failingGuard);

        const result = await flowController.transitionTo(GameState.MATCH_SIM);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Lineup invalid');
        expect(flowController.getCurrentState()).toBe(GameState.BOOT);
    });

    it('should allow transition if guard passes', async () => {
        const passingGuard: TransitionGuard = {
            canTransition: () => true
        };

        flowController.registerGuard(GameState.HUB, passingGuard);

        const result = await flowController.transitionTo(GameState.HUB);
        expect(result.success).toBe(true);
        expect(flowController.getCurrentState()).toBe(GameState.HUB);
    });

    it('should call onStateChange callback on successful transition', async () => {
        let changedState: GameState | null = null;
        flowController.setOnStateChange((state) => {
            changedState = state;
        });

        await flowController.transitionTo(GameState.HUB);
        expect(changedState).toBe(GameState.HUB);
    });
});
