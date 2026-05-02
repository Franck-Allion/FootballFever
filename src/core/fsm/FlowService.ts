import { FlowController } from './FlowController';
import { GameState } from './GameState';
import { useFlowStore } from '../store/useFlowStore';

export class FlowService {
    private static instance: FlowService;
    private controller: FlowController;

    private constructor() {
        const initialStatus = useFlowStore.getState().currentState;
        this.controller = new FlowController(initialStatus);

        this.controller.setOnStateChange((state) => {
            useFlowStore.getState().setGameState(state);
        });
    }

    public static getInstance(): FlowService {
        if (!FlowService.instance) {
            FlowService.instance = new FlowService();
        }
        return FlowService.instance;
    }

    /**
     * Resets the singleton instance. Use only for testing purposes.
     */
    public static resetInstance(): void {
        FlowService.instance = (undefined as unknown) as FlowService;
    }

    public getController(): FlowController {
        return this.controller;
    }

    public async navigateTo(state: GameState): Promise<void> {
        const result = await this.controller.transitionTo(state);
        if (!result.success) {
            useFlowStore.getState().setError(result.error || 'Transition failed');
            console.error(`[FlowService] ${result.error}`);
        }
    }
}
