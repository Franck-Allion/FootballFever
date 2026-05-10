import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useMatchWorker } from '@domains/match/hooks/useMatchWorker';
import { useSquadStore } from '@domains/shared/store/useSquadStore';
import { useEconomyStore } from '@core/store/useEconomyStore';
import { GameState } from '@core/fsm/GameState';
import { FlowService } from '@core/fsm/FlowService';
import ProgressPanel from '../shared/ProgressPanel';
import ActionTile from '../shared/ActionTile';
import { TeamRatingService } from '@domains/shared/services/TeamRatingService';
import { TacticalInstructionService } from '@domains/shared/services/TacticalInstructionService';
import { LineupService } from '@domains/shared/services/LineupService';

const resultLabels: Record<string, string> = {
    W: 'V',
    D: 'N',
    L: 'D',
};

const rarityColors: Record<string, string> = {
    Common: 'text-gray-400',
    Rare: 'text-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]',
    Epic: 'text-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]',
    Legendary: 'text-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
};
const HubScreen: React.FC = () => {
    const { t, language, setLanguage: setGlobalLanguage } = useTranslation();
    const {
        division,
        teamName,
        teamLogo,
        formation,
        gameInstruction,
        overallRating,
        composites,
        staminaAvg,
        morale,
        streak,
        routeNodes,
        roster,
        lineupSlots,
        benchSlots,
        initializeRoster,
        computeOverallRating,
    } = useSquadStore();
    const { prestige } = useEconomyStore();
    const matchWorker = useMatchWorker();
    const hasAttemptedInit = React.useRef(false);

    // Sync local selection with global translation service
    const handleLanguageChange = (lang: string) => {
        setGlobalLanguage(lang as any);
    };

    // Initialize roster if empty or re-initialize to apply new 24-player rule
    useEffect(() => {
        if (roster.length < 24 && !hasAttemptedInit.current) {
            hasAttemptedInit.current = true;
            initializeRoster(true);
        }
    }, [roster.length, initializeRoster]);


    const fatigueAvg = Math.max(0, 100 - staminaAvg);
    const nextMatch = routeNodes.find((node) => node.status === 'current' && node.type === 'match');
    const isMercatoOpen = routeNodes.some((node) => node.status === 'current' && node.type === 'mercato');
    const matchLocation = t('match.home_label'); // Store-driven location logic to be added in future stories

    const handlePlayMatch = () => {
        FlowService.getInstance().navigateTo(GameState.MATCH_SIM);
    };

    const handleOpenTactics = () => {
        FlowService.getInstance().navigateTo(GameState.TACTICS);
    };

    const handleExitToMenu = () => {
        // Stop match worker if running to prevent leaks
        if (matchWorker) {
            matchWorker.terminate();
        }
        FlowService.getInstance().navigateTo(GameState.BOOT);
    };

    const startingEleven = useMemo(() => {
        const assignedEleven = LineupService.getAssignedStarters(roster, formation, lineupSlots);
        return assignedEleven.length > 0 ? assignedEleven : TeamRatingService.selectStartingEleven(roster, formation);
    }, [roster, formation, lineupSlots]);

    const isLineupComplete = useMemo(() => {
        const assignedCount = Object.values(lineupSlots).filter(id => id !== null).length;
        return assignedCount === 11;
    }, [lineupSlots]);

    const activeInstruction = TacticalInstructionService.getInstruction(gameInstruction);
    
    const substitutes = useMemo(() => {
        return Object.values(benchSlots)
            .filter((playerId): playerId is string => Boolean(playerId))
            .map((playerId) => roster.find((player) => player.id === playerId))
            .filter((player): player is typeof roster[number] => Boolean(player));
    }, [benchSlots, roster]);

    return (
        <div className="min-h-screen bg-[#050505] text-[#e3e2e2] pb-10 font-['Space_Grotesk'] selection:bg-[#39ff14]/30 overflow-x-hidden">
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 sm:px-6">
                <header className="flex min-h-20 items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#121212]/70 px-4 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-black/40 shadow-[0_0_15px_rgba(57,255,20,0.15)] border border-white/5">
                            <img src={teamLogo} alt={teamName} className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(57,255,20,0.3)]" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate text-xl font-black uppercase tracking-widest text-[#39ff14] drop-shadow-[0_0_8px_rgba(57,255,20,0.5)] sm:text-2xl">
                                {teamName}
                            </h1>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em]">
                                <span className="text-white/50">{t('hub.division_label')} {division}</span>
                                <span className="h-1 w-1 rounded-full bg-[#39ff14] shadow-[0_0_5px_#39ff14]" aria-hidden="true" />
                                <span className="text-[#39ff14]">{prestige.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} {t('hub.credits_label')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="sr-only" htmlFor="language-select">Changer la langue</label>
                        <select
                            id="language-select"
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="h-10 rounded border border-white/10 bg-black/40 px-3 text-[11px] font-black uppercase tracking-widest text-white/70 outline-none transition-colors hover:border-[#39ff14]/50 focus:border-[#39ff14]"
                        >
                            <option value="fr">FR</option>
                            <option value="en">EN</option>
                            <option value="es">ES</option>
                            <option value="de">DE</option>
                        </select>
                        
                        <div className="h-6 w-px bg-white/10" />

                        <button 
                            onClick={handleExitToMenu}
                            className="flex h-10 w-10 items-center justify-center rounded border border-white/10 bg-black/40 text-white/40 transition-all hover:border-[#39ff14]/50 hover:bg-[#39ff14]/5 hover:text-[#39ff14] active:scale-95"
                            aria-label={t('common.back_to_menu')}
                            title={t('common.back_to_menu')}
                        >
                            <span className="material-symbols-outlined text-xl">home</span>
                        </button>
                    </div>
                </header>

                <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <ProgressPanel label={t('hub.morale_label')} value={morale} status={`${morale}%`} tone="positive" />
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-inner backdrop-blur-2xl min-h-[88px]">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">{t('hub.streak_label')}</p>
                        <div className="mt-4 flex items-center justify-between gap-2" aria-label={`${t('hub.streak_label')}: ${streak.length > 0 ? streak.slice(-5).join(', ') : t('hub.no_history')}`}>
                            {streak.length > 0 ? streak.slice(-5).map((result, index) => {
                                const label = t(`match.${result === 'W' ? 'win_short' : result === 'L' ? 'loss_short' : 'draw_short'}`);
                                const color = result === 'W' ? 'text-[#39ff14]' : result === 'L' ? 'text-red-400' : 'text-white/55';

                                return (
                                    <React.Fragment key={`${result}-${index}`}>
                                        {index > 0 && <span className="text-white/15" aria-hidden="true">-</span>}
                                        <span className={`text-2xl font-black leading-none ${color}`}>{label}</span>
                                    </React.Fragment>
                                );
                            }) : (
                                <p className="text-[11px] font-bold uppercase tracking-widest text-white/20 italic">{t('hub.no_history')}</p>
                            )}
                        </div>
                    </div>
                    <ProgressPanel label={t('hub.fatigue_label')} value={fatigueAvg} status={`${fatigueAvg}%`} tone="warning" />
                </section>

                <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <button 
                        onClick={handleOpenTactics}
                        aria-label={`${t('hub.tactic_label')}: ${formation}. ${t('hub.instruction_label')}: ${activeInstruction.label}.`}
                        className="group min-h-48 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur-2xl transition-all hover:border-[#39ff14]/50 hover:bg-[#39ff14]/5 active:scale-[0.99]"
                    >
                        <div className="flex h-full flex-col justify-between gap-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">{t('hub.tactic_label')}</p>
                                    <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">{formation}</h2>
                                </div>
                                <span className="material-symbols-outlined rounded bg-black/50 p-3 text-3xl text-[#39ff14] shadow-[0_0_14px_rgba(57,255,20,0.25)]" aria-hidden="true">schema</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">{t('hub.instruction_label')}</p>
                                    <p className="mt-1 text-lg font-black uppercase text-[#39ff14]">{t(activeInstruction.label)}</p>
                                </div>
                                <span className="material-symbols-outlined text-white/30 transition-transform group-hover:translate-x-1" aria-hidden="true">chevron_right</span>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={handleOpenTactics}
                        aria-label={`${t('hub.composition_label')}. ${isLineupComplete ? `Note globale: ${overallRating}%` : t('hub.lineup_incomplete')}.`}
                        className={`group min-h-48 rounded-xl border p-5 text-left backdrop-blur-2xl transition-all active:scale-[0.99] ${
                            isLineupComplete 
                                ? 'border-white/10 bg-white/[0.03] hover:border-[#39ff14]/50 hover:bg-[#39ff14]/5' 
                                : 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
                        }`}
                    >
                        <div className="flex h-full flex-col gap-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">{t('hub.composition_label')}</p>
                                    <h2 className={`mt-2 text-3xl font-black uppercase tracking-tight ${isLineupComplete ? 'text-[#39ff14]' : 'text-amber-500'}`}>
                                        {isLineupComplete ? `${overallRating}%` : '--%'}
                                    </h2>
                                    {!isLineupComplete && (
                                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-amber-500/80 animate-pulse">
                                            {t('hub.incomplete_label')}
                                        </p>
                                    )}
                                </div>
                                <span className={`material-symbols-outlined rounded bg-black/50 p-3 text-3xl shadow-[0_0_14px_rgba(0,0,0,0.25)] ${isLineupComplete ? 'text-[#39ff14]' : 'text-amber-500 animate-bounce'}`} aria-hidden="true">
                                    {isLineupComplete ? 'groups' : 'warning'}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="border border-white/10 bg-black/25 px-2 py-1.5">
                                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/35">{t('hub.attr_atk')}</p>
                                    <p className="text-sm font-black text-white">{isLineupComplete ? composites.attack : '??'}</p>
                                </div>
                                <div className="border border-white/10 bg-black/25 px-2 py-1.5">
                                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/35">{t('hub.attr_mid')}</p>
                                    <p className="text-sm font-black text-white">{isLineupComplete ? composites.midfield : '??'}</p>
                                </div>
                                <div className="border border-white/10 bg-black/25 px-2 py-1.5">
                                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/35">{t('hub.attr_def')}</p>
                                    <p className="text-sm font-black text-white">{isLineupComplete ? composites.defense : '??'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-y-1 sm:grid-cols-2">
                                {isLineupComplete ? startingEleven.map(({ player, assignedPosition, rating }) => (
                                    <div key={player.id} className="flex items-center gap-2 min-w-0">
                                        <div className="h-6 w-6 shrink-0 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                                            <img src={player.portraitUrl || '/assets/portraits/default.png'} alt="" className="h-full w-full object-cover" />
                                        </div>
                                        <span className="shrink-0 text-[9px] font-black uppercase text-white/35">{assignedPosition}</span>
                                        <span className={`truncate text-[11px] font-bold uppercase tracking-wide ${rarityColors[player.rarity]}`}>
                                            {player.name}
                                        </span>
                                        <span className="ml-auto shrink-0 text-[10px] font-black text-white/45">{rating}</span>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-4 text-center">
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 italic">
                                            {t('hub.lineup_incomplete')}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-auto border-t border-white/10 pt-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/30">{t('hub.substitutes_label')}</p>
                                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] font-bold uppercase tracking-wide text-white/45">
                                    {substitutes.map((player, i) => (
                                        <React.Fragment key={player.id}>
                                            {i > 0 && <span>-</span>}
                                            <span className={rarityColors[player.rarity]}>{player.name}</span>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </button>
                </section>

                <button
                    disabled={!isLineupComplete}
                    onClick={handlePlayMatch}
                    title={!isLineupComplete ? t('hub.lineup_incomplete') : undefined}
                    aria-label={`${t('hub.play_button')}: ${teamName} vs ${nextMatch?.opponent || t('hub.unknown_opponent')}`}
                    className={`group relative min-h-28 overflow-hidden rounded-xl px-6 py-5 transition-all active:scale-[0.99] ${
                        isLineupComplete 
                            ? 'bg-[#39ff14] text-black shadow-[0_0_40px_rgba(57,255,20,0.28)] hover:shadow-[0_0_60px_rgba(57,255,20,0.42)]' 
                            : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed grayscale'
                    }`}
                >
                    {isLineupComplete && <div className="absolute inset-0 translate-x-[-100%] skew-x-[-45deg] bg-white/25 transition-transform duration-1000 group-hover:translate-x-[100%]" aria-hidden="true" />}
                    <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-5 text-left">
                            <span className={`material-symbols-outlined rounded p-3 text-4xl ${isLineupComplete ? 'bg-black text-[#39ff14]' : 'bg-white/5 text-white/10'}`} style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
                                {isLineupComplete ? 'play_arrow' : 'lock'}
                            </span>
                            <div>
                                <p className="text-4xl font-black uppercase italic leading-none tracking-tight">{t('hub.play_button')}</p>
                                <p className="mt-2 text-[11px] font-black uppercase tracking-[0.28em] opacity-70">
                                    {isLineupComplete ? (
                                        <>
                                            {teamName} - {matchLocation}
                                            {nextMatch?.opponent ? ` vs ${nextMatch.opponent}` : ` vs ${t('hub.unknown_opponent')}`}
                                        </>
                                    ) : t('hub.lineup_incomplete')}
                                </p>
                            </div>
                        </div>
                        {isLineupComplete && <span className="material-symbols-outlined text-4xl transition-transform group-hover:translate-x-2" aria-hidden="true">chevron_right</span>}
                    </div>
                </button>

                <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <ActionTile 
                        icon="shopping_cart" 
                        title={t('hub.shop_label')} 
                        subtitle={t('hub.shop_subtitle')} 
                        ariaLabel={t('hub.shop_label')}
                    />
                    <ActionTile
                        disabled={!isMercatoOpen}
                        icon="swap_horiz"
                        title={t('hub.mercato_label')}
                        subtitle={isMercatoOpen ? t('hub.mercato_subtitle') : t('hub.rest_day')}
                        ariaLabel={isMercatoOpen ? t('hub.mercato_label') : t('hub.rest_day')}
                    />
                </section>
            </main>
        </div>
    );
};

export default HubScreen;
