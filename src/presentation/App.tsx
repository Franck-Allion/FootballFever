import { useRef, useState, useEffect } from 'react';
import { IRefPhaserGame, PhaserGame } from '@ui/PhaserGame';
import { MainMenu } from '@game/scenes/MainMenu';
import { useFlowStore } from '@core/store/useFlowStore';
import { GameState } from '@core/fsm/GameState';
import { FlowService } from '@core/fsm/FlowService';
import { LoggerService, LogDomain } from '@core/services/logger/LoggerService';
import { useTripleTap } from './hooks/useTripleTap';
import { useDebugStore } from '@core/store/useDebugStore';
import { DebugConsole } from './ui/debug/DebugConsole';
import { useEconomyStore } from '@core/store/useEconomyStore';
import { useTranslation } from './hooks/useTranslation';
import { LanguageSelector } from './ui/settings/LanguageSelector';
import { useMatchWorker } from '@domains/match/hooks/useMatchWorker';

function App()
{
    const { t } = useTranslation();
    const { currentState, error, persistenceNotice } = useFlowStore();
    const { prestige } = useEconomyStore();
    const flowService = FlowService.getInstance();
    const logger = LoggerService.getInstance();
    const toggleDebug = useDebugStore((state) => state.toggleVisibility);

    useMatchWorker();
    useTripleTap(toggleDebug);

    useEffect(() => {
        logger.info('App Component Mounted', undefined, LogDomain.UI);
    }, [logger]);

    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

    const changeScene = () => {

        if(phaserRef.current)
        {     
            const scene = phaserRef.current.scene as MainMenu;

            if (scene)
            {
                scene.changeScene();
            }
        }
    }

    const moveSprite = () => {

        if(phaserRef.current)
        {

            const scene = phaserRef.current.scene as MainMenu;

            if (scene && scene.scene.key === 'MainMenu')
            {
                // Get the update logo position
                scene.moveLogo(({ x, y }) => {

                    setSpritePosition({ x, y });

                });
            }
        }

    }

    const addSprite = () => {

        if (phaserRef.current)
        {
            const scene = phaserRef.current.scene;

            if (scene)
            {
                // Add more stars
                const x = Phaser.Math.Between(64, scene.scale.width - 64);
                const y = Phaser.Math.Between(64, scene.scale.height - 64);

                //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
                const star = scene.add.sprite(x, y, 'star');

                //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
                //  You could, of course, do this from within the Phaser Scene code, but this is just an example
                //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
                scene.add.tween({
                    targets: star,
                    duration: 500 + Math.random() * 1000,
                    alpha: 0,
                    yoyo: true,
                    repeat: -1
                });
            }
        }
    }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {

        setCanMoveSprite(scene.scene.key !== 'MainMenu');

    }

    return (
        <div id="app" className="flex flex-col items-center p-4">
            <DebugConsole />
            
            <div className="flex gap-4 mb-4 items-center">
                <div className="text-xl font-bold bg-gray-800 text-white p-2 rounded shadow-lg">
                    {t('common.current_state')}: <span className="text-yellow-400">{currentState}</span>
                </div>
                <div className="text-xl font-bold bg-indigo-900 text-white p-2 rounded shadow-lg border-2 border-indigo-400">
                    {t('common.prestige')}: <span className="text-yellow-300">{prestige}</span>
                </div>
                <LanguageSelector />
            </div>

            {error && (
                <div className="mb-4 p-2 bg-red-600 text-white rounded border-2 border-red-900 animate-pulse">
                    {t('common.error')}: {error}
                </div>
            )}

            {persistenceNotice && (
                <div className="mb-4 p-2 bg-amber-500 text-black rounded border-2 border-amber-700 flex justify-between items-center gap-4">
                    <span>{t(persistenceNotice)}</span>
                    <button 
                        onClick={() => useFlowStore.getState().setPersistenceNotice(null)}
                        className="bg-amber-700/20 hover:bg-amber-700/40 px-2 py-0.5 rounded text-xs font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="flex gap-2 mb-8">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" onClick={() => flowService.navigateTo(GameState.BOOT)}>{t('common.reset_boot')}</button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded" onClick={() => flowService.navigateTo(GameState.HUB)}>{t('common.go_hub')}</button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded" onClick={() => flowService.navigateTo(GameState.MATCH_SIM)}>{t('common.attempt_match')}</button>
            </div>

            {currentState === GameState.BOOT && (
                <div className="text-center p-10 bg-blue-100 rounded-lg shadow-inner border-2 border-blue-300">
                    <h1 className="text-3xl font-black text-blue-900 mb-2">{t('common.game_title')}</h1>
                    <p className="text-blue-700 italic">{t('common.initializing')}</p>
                    <button className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors shadow" onClick={() => flowService.navigateTo(GameState.HUB)}>{t('common.press_start')}</button>
                </div>
            )}

            {(currentState === GameState.HUB || currentState === GameState.MATCH_SIM) && (
                <div className="relative border-4 border-gray-700 rounded-xl overflow-hidden shadow-2xl">
                    <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

                    {currentState === GameState.HUB && (
                        <div className="absolute top-4 right-4 bg-white/90 p-4 rounded-lg shadow-lg border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-2">{t('hub.team_management')}</h3>
                            <div className="flex flex-col gap-2">
                                <button className="bg-blue-500 text-white py-1 px-3 rounded text-sm" onClick={changeScene}>{t('hub.toggle_phaser_scene')}</button>
                                <button disabled={canMoveSprite} className="bg-orange-500 disabled:bg-gray-400 text-white py-1 px-3 rounded text-sm" onClick={moveSprite}>{t('hub.toggle_movement')}</button>
                                <button className="bg-pink-500 text-white py-1 px-3 rounded text-sm" onClick={addSprite}>{t('hub.add_fx_sprite')}</button>
                                <button className="mt-2 bg-green-600 text-white py-2 px-3 rounded font-bold hover:bg-green-700" onClick={() => flowService.navigateTo(GameState.MATCH_SIM)}>{t('common.play_match')}</button>
                            </div>
                        </div>
                    )}

                    {currentState === GameState.MATCH_SIM && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                            <div className="bg-red-600 text-white px-6 py-3 rounded-full font-black text-2xl animate-bounce shadow-2xl border-4 border-white">
                                {t('common.simulating_match')}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono border border-gray-300">
                {t('common.sprite_position')}: x: {spritePosition.x.toFixed(0)}, y: {spritePosition.y.toFixed(0)}
            </div>
        </div>
    )
}

export default App;
