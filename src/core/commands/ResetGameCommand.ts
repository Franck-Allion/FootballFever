import { DatabaseService } from '@core/services/database/DatabaseService';
import { useSquadStore } from '@domains/shared/store/useSquadStore';
import { useEconomyStore } from '@core/store/useEconomyStore';
import { useMatchLogStore } from '@domains/match/store/useMatchLogStore';
import { FlowService } from '@core/fsm/FlowService';
import { GameState } from '@core/fsm/GameState';
import { Command, CommandBus } from './CommandBus';

export const RESET_GAME_COMMAND = 'RESET_GAME_COMMAND';

export async function handleResetGame(command: Command): Promise<void> {
    // 1. Clear database
    await DatabaseService.getInstance().clearAll();
    
    // 2. Clear stores
    await useSquadStore.getState().initializeRoster(true); // Forces new generation
    useEconomyStore.getState().reset();
    useMatchLogStore.getState().clearLogs();
    
    // 3. Navigate to HUB
    FlowService.getInstance().navigateTo(GameState.HUB);
}

// Register the handler
CommandBus.getInstance().register(RESET_GAME_COMMAND, handleResetGame);
