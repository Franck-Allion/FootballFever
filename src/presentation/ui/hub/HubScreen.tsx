import React, { useState, useEffect, useMemo } from 'react';
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
    const {
        teamName,
        teamLogo,
        division,
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
    const [language, setLanguage] = useState('fr');

    // Initialize roster if empty or re-initialize to apply new 24-player rule
    useEffect(() => {
        if (roster.length < 24) {
            initializeRoster(true);
        }
    }, [roster.length, initializeRoster]);

    const fatigueAvg = Math.max(0, 100 - staminaAvg);
    const nextMatch = routeNodes.find((node) => node.status === 'current' && node.type === 'match');
    const isMercatoOpen = routeNodes.some((node) => node.status === 'current' && node.type === 'mercato');
    const matchLocation = 'Domicile';

    const handlePlayMatch = () => {
        FlowService.getInstance().navigateTo(GameState.MATCH_SIM);
    };

    const handleOpenTactics = () => {
        FlowService.getInstance().navigateTo(GameState.TACTICS);
    };

    const startingEleven = useMemo(() => {
        const assignedEleven = LineupService.getAssignedStarters(roster, formation, lineupSlots);
        return assignedEleven.length > 0 ? assignedEleven : TeamRatingService.selectStartingEleven(roster, formation);
    }, [roster, formation, lineupSlots]);

    const activeInstruction = TacticalInstructionService.getInstruction(gameInstruction);
    
    const startingIds = useMemo(() => new Set(startingEleven.map(({ player }) => player.id)), [startingEleven]);

    const substitutes = useMemo(() => {
        const assignedSubstitutes = Object.values(benchSlots)
            .filter((playerId): playerId is string => Boolean(playerId))
            .map((playerId) => roster.find((player) => player.id === playerId))
            .filter((player): player is typeof roster[number] => Boolean(player));
        
        return assignedSubstitutes.length > 0
            ? assignedSubstitutes
            : roster
                .filter((player) => !startingIds.has(player.id))
                .sort((a, b) => b.overallRating - a.overallRating)
                .slice(0, 5);
    }, [benchSlots, roster, startingIds]);

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
                                <span className="text-white/50">Division {division}</span>
                                <span className="h-1 w-1 rounded-full bg-[#39ff14] shadow-[0_0_5px_#39ff14]" aria-hidden="true" />
                                <span className="text-[#39ff14]">{prestige.toLocaleString('fr-FR')} credits</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="sr-only" htmlFor="language-select">Changer la langue</label>
                        <select
                            id="language-select"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="h-10 rounded border border-white/10 bg-black/40 px-3 text-[11px] font-black uppercase tracking-widest text-white/70 outline-none transition-colors hover:border-[#39ff14]/50 focus:border-[#39ff14]"
                        >
                            <option value="fr">FR</option>
                            <option value="en">EN</option>
                            <option value="es">ES</option>
                            <option value="de">DE</option>
                        </select>
                    </div>
                </header>

                <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <ProgressPanel label="Moral de l'equipe" value={morale} status={`${morale}%`} tone="positive" />
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-inner backdrop-blur-2xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">Serie en cours</p>
                        <div className="mt-4 flex items-center justify-between gap-2" aria-label={`Derniers résultats: ${streak.slice(-5).join(', ')}`}>
                            {streak.slice(-5).map((result, index) => {
                                const label = resultLabels[result] ?? result;
                                const color = label === 'V' ? 'text-[#39ff14]' : label === 'D' ? 'text-red-400' : 'text-white/55';

                                return (
                                    <React.Fragment key={`${result}-${index}`}>
                                        {index > 0 && <span className="text-white/15" aria-hidden="true">-</span>}
                                        <span className={`text-2xl font-black leading-none ${color}`}>{label}</span>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                    <ProgressPanel label="Fatigue de l'equipe" value={fatigueAvg} status={`${fatigueAvg}%`} tone="warning" />
                </section>

                <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <button 
                        onClick={handleOpenTactics}
                        aria-label={`Tactique actuelle: ${formation}. Consigne: ${activeInstruction.label}. Cliquez pour modifier.`}
                        className="group min-h-48 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur-2xl transition-all hover:border-[#39ff14]/50 hover:bg-[#39ff14]/5 active:scale-[0.99]"
                    >
                        <div className="flex h-full flex-col justify-between gap-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">Tactique</p>
                                    <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">{formation}</h2>
                                </div>
                                <span className="material-symbols-outlined rounded bg-black/50 p-3 text-3xl text-[#39ff14] shadow-[0_0_14px_rgba(57,255,20,0.25)]" aria-hidden="true">schema</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">Consigne</p>
                                    <p className="mt-1 text-lg font-black uppercase text-[#39ff14]">{activeInstruction.label}</p>
                                </div>
                                <span className="material-symbols-outlined text-white/30 transition-transform group-hover:translate-x-1" aria-hidden="true">chevron_right</span>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={handleOpenTactics}
                        aria-label={`Composition de l'équipe. Note globale: ${overallRating}%. Cliquez pour gérer l'effectif.`}
                        className="group min-h-48 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur-2xl transition-all hover:border-[#39ff14]/50 hover:bg-[#39ff14]/5 active:scale-[0.99]"
                    >
                        <div className="flex h-full flex-col gap-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">Composition</p>
                                    <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-[#39ff14]">{overallRating}%</h2>
                                </div>
                                <span className="material-symbols-outlined rounded bg-black/50 p-3 text-3xl text-[#39ff14] shadow-[0_0_14px_rgba(57,255,20,0.25)]" aria-hidden="true">groups</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="border border-white/10 bg-black/25 px-2 py-1.5">
                                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/35">Att</p>
                                    <p className="text-sm font-black text-white">{composites.attack}</p>
                                </div>
                                <div className="border border-white/10 bg-black/25 px-2 py-1.5">
                                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/35">Mil</p>
                                    <p className="text-sm font-black text-white">{composites.midfield}</p>
                                </div>
                                <div className="border border-white/10 bg-black/25 px-2 py-1.5">
                                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/35">Def</p>
                                    <p className="text-sm font-black text-white">{composites.defense}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-y-1 sm:grid-cols-2">
                                {startingEleven.map(({ player, assignedPosition, rating }) => (
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
                                ))}
                            </div>
                            <div className="mt-auto border-t border-white/10 pt-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/30">Remplacants</p>
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
                    onClick={handlePlayMatch}
                    aria-label={`Jouer le prochain match: ${teamName} contre ${nextMatch?.opponent || 'adversaire inconnu'}`}
                    className="group relative min-h-28 overflow-hidden rounded-xl bg-[#39ff14] px-6 py-5 text-black shadow-[0_0_40px_rgba(57,255,20,0.28)] transition-all hover:shadow-[0_0_60px_rgba(57,255,20,0.42)] active:scale-[0.99]"
                >
                    <div className="absolute inset-0 translate-x-[-100%] skew-x-[-45deg] bg-white/25 transition-transform duration-1000 group-hover:translate-x-[100%]" aria-hidden="true" />
                    <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-5 text-left">
                            <span className="material-symbols-outlined rounded bg-black p-3 text-4xl text-[#39ff14]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">play_arrow</span>
                            <div>
                                <p className="text-4xl font-black uppercase italic leading-none tracking-tight">Play</p>
                                <p className="mt-2 text-[11px] font-black uppercase tracking-[0.28em] opacity-70">
                                    {teamName} - {matchLocation}
                                    {nextMatch?.opponent ? ` vs ${nextMatch.opponent}` : ''}
                                </p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-4xl transition-transform group-hover:translate-x-2" aria-hidden="true">chevron_right</span>
                    </div>
                </button>

                <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <ActionTile 
                        icon="shopping_cart" 
                        title="Boutique" 
                        subtitle="Acheter de l'equipement" 
                        ariaLabel="Ouvrir la boutique pour acheter de l'équipement"
                    />
                    <ActionTile
                        disabled={!isMercatoOpen}
                        icon="swap_horiz"
                        title="Mercato"
                        subtitle={isMercatoOpen ? 'Vendre ou drafter des joueurs' : 'Hors periode de mercato'}
                        ariaLabel={isMercatoOpen ? "Ouvrir le mercato pour vendre ou drafter des joueurs" : "Mercato fermé actuellement"}
                    />
                </section>
            </main>
        </div>
    );
};

export default HubScreen;
