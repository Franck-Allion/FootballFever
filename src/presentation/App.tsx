import { useRef, useEffect } from 'react';
import { IRefPhaserGame, PhaserGame } from '@ui/PhaserGame';
import { useFlowStore } from '@core/store/useFlowStore';
import { GameState } from '@core/fsm/GameState';
import { FlowService } from '@core/fsm/FlowService';
import { LoggerService, LogDomain } from '@core/services/logger/LoggerService';
import { useTripleTap } from './hooks/useTripleTap';
import { useDebugStore } from '@core/store/useDebugStore';
import { DebugConsole } from './ui/debug/DebugConsole';
import { useTranslation } from './hooks/useTranslation';
import { useMatchWorker } from '@domains/match/hooks/useMatchWorker';
import { CommandBus } from '@core/commands/CommandBus';
import { RESET_GAME_COMMAND } from '@core/commands/ResetGameCommand';
import HubScreen from './ui/hub/HubScreen';
import MatchSimulationScreen from './ui/match/MatchSimulationScreen';
import TacticsScreen from './ui/tactics/TacticsScreen';
import MainMenu from './ui/menu/MainMenu';

function App()
{
    const { t } = useTranslation();
    const { currentState, error, persistenceNotice } = useFlowStore();
    const flowService = FlowService.getInstance();
    const logger = LoggerService.getInstance();
    const toggleDebug = useDebugStore((state) => state.toggleVisibility);

    const matchWorker = useMatchWorker();
    useTripleTap(toggleDebug);

    useEffect(() => {
        logger.info('App Component Mounted', undefined, LogDomain.UI);
    }, [logger]);

    useEffect(() => {
        if (currentState !== GameState.MATCH_SIM || !matchWorker) {
            return;
        }

        matchWorker.startMatch('HUB_MATCH_1', 7_202);
    }, [currentState, matchWorker]);

    const handleContinue = () => {
        flowService.navigateTo(GameState.HUB);
    };

    const handleNewGame = async () => {
        await CommandBus.getInstance().dispatch({ type: RESET_GAME_COMMAND });
    };

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    // Event emitted from the PhaserGame component
    const currentScene = (/* scene: Phaser.Scene */) => {
        // Handle scene changes if needed
    }

    return (
        <div id="app" className="min-h-screen bg-[#0d0e0f]">
            <DebugConsole />
            
            {error && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 bg-red-600 text-white rounded border-2 border-red-900 animate-pulse shadow-2xl">
                    {t('common.error')}: {error}
                </div>
            )}

            {persistenceNotice && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 bg-amber-500 text-black rounded border-2 border-amber-700 flex justify-between items-center gap-4 shadow-2xl">
                    <span>{t(persistenceNotice)}</span>
                    <button 
                        onClick={() => useFlowStore.getState().setPersistenceNotice(null)}
                        className="bg-amber-700/20 hover:bg-amber-700/40 px-2 py-0.5 rounded text-xs font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}

            {currentState === GameState.BOOT && (
                <div className="flex items-center justify-center min-h-screen">
                    <MainMenu onContinue={handleContinue} onNewGame={handleNewGame} />
                </div>
            )}

            {currentState === GameState.HUB && <HubScreen />}

            {currentState === GameState.TACTICS && <TacticsScreen />}

            {currentState === GameState.MATCH_SIM && (
                <div className="flex flex-col items-center justify-center min-h-screen p-4">
                    <MatchSimulationScreen />
                    {/* Hidden Phaser instance to satisfy phaserRef dependencies without visual clutter */}
                    <div className="hidden">
                        <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
                    </div>
                </div>
            )}
        </div>
    )
}

export default App;
