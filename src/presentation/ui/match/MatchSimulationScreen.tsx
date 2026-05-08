import { useEffect, memo, type CSSProperties } from 'react';
import { List, useListRef } from 'react-window';
import { useMatchLogStore, type MatchLogEntry } from '@domains/match/store/useMatchLogStore';
import { useSquadStore } from '@domains/shared/store/useSquadStore';
import { FlowService } from '@core/fsm/FlowService';
import { GameState } from '@core/fsm/GameState';
import { getMatchWorkerClient } from '@domains/match/MatchWorkerClient';
import { useTranslation } from '../../hooks/useTranslation';

interface RowData {
    logs: MatchLogEntry[];
    t: (key: string, params?: (string | number)[]) => string;
}

// Optimization: Row component outside for better reconciliation
const CommentaryRow = memo(({ index, style, logs, t }: { index: number; style: CSSProperties } & RowData) => {
    const log = logs[index];
    if (!log) return null;
    
    const isGoal = log.type === 'GOAL';
    const isWhistle = log.type === 'WHISTLE';

    return (
        <div style={style} className="flex gap-4 px-4 py-2 border-b border-white/5 items-center">
            <span className="w-12 shrink-0 font-['Space_Grotesk'] font-black text-[#39ff14]/60 text-xs">
                {String(log.minute).padStart(2, '0')}:{String(log.second).padStart(2, '0')}"
            </span>
            <p className={`text-sm font-['Space_Grotesk'] leading-tight tracking-tight ${isGoal ? 'text-[#39ff14] font-black italic uppercase drop-shadow-[0_0_8px_#39ff14]' : isWhistle ? 'text-amber-400 font-bold uppercase' : 'text-white/80'}`}>
                {t(log.text, log.params)}
            </p>
        </div>
    );
});

const MatchSimulationScreen: React.FC = () => {
    const { 
        logs, 
        currentTime, 
        homeScore, 
        awayScore, 
        isPaused, 
        isHalfTime, 
        isFinished,
        finalStamina,
        seed
    } = useMatchLogStore();
    
    const { teamName, finalizeMatchDay } = useSquadStore();
    const listRef = useListRef(null);
    const { t } = useTranslation();

    // Auto-scroll to top (newest first)
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollToRow({ index: 0, align: 'start' });
        }
    }, [logs.length, listRef]);

    const handleResume = () => {
        getMatchWorkerClient().resumeMatch();
    };

    const handleExit = () => {
        if (isFinished && seed !== null) {
            finalizeMatchDay({ homeScore, awayScore }, finalStamina.home, seed);
        }
        FlowService.getInstance().navigateTo(GameState.HUB);
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-[#050505]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Header: Pro Scoreboard */}
            <div className="bg-black/60 p-6 border-b border-[#39ff14]/20 flex justify-between items-center px-10 relative">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#39ff14]/30 to-transparent" />
                
                <div className="text-right flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{t('match.home_label')}</p>
                    <h2 className="text-lg font-black text-white truncate font-['Space_Grotesk'] uppercase">{teamName}</h2>
                </div>
                
                <div className="flex flex-col items-center mx-8">
                    <div className="text-[11px] font-black text-[#39ff14]/70 mb-2 font-['Space_Grotesk'] tabular-nums tracking-widest bg-black/40 px-3 py-0.5 rounded-full border border-white/5">
                        {String(currentTime.min).padStart(2, '0')}:{String(currentTime.sec).padStart(2, '0')}
                    </div>
                    <div className="bg-[#39ff14]/5 px-6 py-2 rounded-lg border border-[#39ff14]/40 shadow-[0_0_20px_rgba(57,255,20,0.1)] flex items-center gap-4">
                        <span className="text-4xl font-black text-[#39ff14] tracking-tighter font-['Space_Grotesk'] tabular-nums">
                            {homeScore}
                        </span>
                        <span className="text-white/20 font-black text-2xl">-</span>
                        <span className="text-4xl font-black text-[#39ff14] tracking-tighter font-['Space_Grotesk'] tabular-nums">
                            {awayScore}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className={`h-1 w-1 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-[#39ff14] animate-pulse'}`} />
                        <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">
                            {isPaused ? t('match.paused') : t('match.live_sim')}
                        </p>
                    </div>
                </div>

                <div className="text-left flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{t('match.away_label')}</p>
                    <h2 className="text-lg font-black text-white truncate font-['Space_Grotesk'] uppercase">ADVERSARY</h2>
                </div>
            </div>

            {/* Virtualized Feed (Newest on Top) */}
            <div className="flex-1 bg-black/20 relative">
                {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <div className="h-8 w-8 border-2 border-[#39ff14]/20 border-t-[#39ff14] rounded-full animate-spin" />
                        <p className="text-white/20 uppercase tracking-[0.4em] text-[10px] font-black">{t('common.initializing')}</p>
                    </div>
                ) : (
                    <List<RowData>
                        listRef={listRef}
                        rowCount={logs.length}
                        rowHeight={52}
                        rowComponent={(props) => <CommentaryRow {...props} />}
                        rowProps={{ logs, t }}
                        style={{ height: 420, width: '100%' }}
                        className="scrollbar-hide"
                    />
                )}

                {/* Overlays for HT/FT */}
                {(isHalfTime || isFinished) && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-10 text-center animate-in fade-in duration-500">
                        <div className="border border-white/10 bg-[#121212] p-8 rounded-2xl shadow-2xl max-w-xs w-full">
                            <h3 className="text-[#39ff14] font-black text-2xl uppercase italic tracking-tighter mb-2 font-['Space_Grotesk']">
                                {isHalfTime ? t('match.ht_overlay_title') : t('match.ft_overlay_title')}
                            </h3>
                            <p className="text-white/60 text-xs font-medium mb-8 leading-relaxed font-['Space_Grotesk']">
                                {isHalfTime ? t('match.ht_overlay_desc') : t('match.ft_overlay_desc')}
                            </p>
                            
                            {isHalfTime ? (
                                <button 
                                    onClick={handleResume}
                                    className="w-full bg-[#39ff14] text-black font-black py-4 rounded-xl shadow-[0_0_30px_rgba(57,255,20,0.4)] hover:scale-105 transition-transform uppercase tracking-widest text-sm font-['Space_Grotesk']"
                                >
                                    {t('match.resume_button')}
                                </button>
                            ) : (
                                <button 
                                    onClick={handleExit}
                                    className="w-full bg-white text-black font-black py-4 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform uppercase tracking-widest text-sm font-['Space_Grotesk']"
                                >
                                    {t('match.exit_button')}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className="bg-black/60 p-4 border-t border-white/5 flex justify-between items-center px-8">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#39ff14] text-sm">database</span>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Match Worker ACTIVE</p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#39ff14]">X15 ACCELERATION</p>
                </div>
            </div>
        </div>
    );
};

export default MatchSimulationScreen;
