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
import HubScreen from './ui/hub/HubScreen';
import MatchSimulationScreen from './ui/match/MatchSimulationScreen';
import TacticsScreen from './ui/tactics/TacticsScreen';

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
                    <div className="text-center p-10 bg-[#121212] rounded-lg shadow-2xl border border-white/10 max-w-sm w-full">
                        <h1 className="text-4xl font-black text-[#39ff14] mb-2 font-['Space_Grotesk'] tracking-tighter italic">FOOTBALL FEVER</h1>
                        <p className="text-white/40 italic mb-8 uppercase text-[10px] tracking-[0.3em]">{t('common.initializing')}</p>
                        <button 
                            className="w-full bg-[#39ff14] text-black font-black py-4 rounded shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] transition-all active:scale-95 uppercase tracking-widest" 
                            onClick={() => flowService.navigateTo(GameState.HUB)}
                        >
                            {t('common.press_start')}
                        </button>
                    </div>
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
