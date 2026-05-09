import React, { useEffect, useState } from 'react';
import { DatabaseService } from '@core/services/database/DatabaseService';
import { useTranslation } from '../../hooks/useTranslation';
import ActionTile from '../shared/ActionTile';

interface MainMenuProps {
    onContinue: () => void;
    onNewGame: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onContinue, onNewGame }) => {
    const { t } = useTranslation();
    const [canContinue, setCanContinue] = useState(false);
    const [showConfirm, setShowNewGameConfirm] = useState(false);

    useEffect(() => {
        const checkSave = async () => {
            const hasSave = await DatabaseService.getInstance().hasSave();
            setCanContinue(hasSave);
        };
        checkSave();
    }, []);

    const handleNewGameRequest = () => {
        if (canContinue) {
            setShowNewGameConfirm(true);
        } else {
            onNewGame();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-6">
            <div className="text-center mb-4">
                <h1 className="text-6xl font-black italic tracking-tighter text-[#39ff14] drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]">
                    {t('common.game_title')}
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mt-2">
                    {t('common.tagline')}
                </p>
            </div>

            {!showConfirm ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    <ActionTile
                        icon="play_arrow"
                        title={t('common.continue')}
                        subtitle={t('common.continue_subtitle')}
                        disabled={!canContinue}
                        onClick={onContinue}
                    />
                    <ActionTile
                        icon="fiber_new"
                        title={t('common.new_game')}
                        subtitle={t('common.new_game_subtitle')}
                        onClick={handleNewGameRequest}
                    />
                </div>
            ) : (
                <div className="w-full max-w-md rounded-xl border border-red-500/30 bg-red-500/5 p-8 text-center backdrop-blur-3xl animate-in zoom-in-95 duration-200">
                    <h2 className="text-2xl font-black uppercase text-red-500 mb-2">{t('common.confirm_new_game_title')}</h2>
                    <p className="text-sm text-white/70 mb-8">
                        {t('common.confirm_new_game_desc')}
                    </p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={onNewGame}
                            className="w-full rounded-lg bg-red-500 py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-red-600 transition-colors"
                        >
                            {t('common.confirm_new_game_btn')}
                        </button>
                        <button
                            onClick={() => setShowNewGameConfirm(false)}
                            className="w-full rounded-lg border border-white/10 bg-white/5 py-4 text-sm font-black uppercase tracking-widest text-white/70 hover:bg-white/10 transition-colors"
                        >
                            {t('common.confirm_back_btn')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainMenu;
