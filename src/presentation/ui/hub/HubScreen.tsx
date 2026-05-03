import React from 'react';
import { useSquadStore } from '@domains/shared/store/useSquadStore';
import { useEconomyStore } from '@core/store/useEconomyStore';
import { GameState } from '@core/fsm/GameState';
import { FlowService } from '@core/fsm/FlowService';

const startingEleven = [
    'M. Varga',
    'L. Chen',
    'R. Diallo',
    'T. Okafor',
    'N. Silva',
    'A. Novak',
    'S. Ito',
    'J. Morel',
    'K. Mensah',
    'E. Cruz',
    'P. Laurent',
];

const substitutes = ['B. Meyer', 'Y. Haddad', 'C. Rossi', 'D. Costa', 'F. Park'];

const moraleScoreByState = {
    LOW: 24,
    STABLE: 55,
    HIGH: 78,
    EXCESSIVE: 94,
} as const;

const resultLabels: Record<string, string> = {
    W: 'V',
    D: 'N',
    L: 'D',
};

const HubScreen: React.FC = () => {
    const {
        teamName,
        teamLogo,
        division,
        formation,
        overallRating,
        staminaAvg,
        morale,
        streak,
        routeNodes,
    } = useSquadStore();
    const { prestige } = useEconomyStore();

    const fatigueAvg = Math.max(0, 100 - staminaAvg);
    const moraleScore = moraleScoreByState[morale];
    const nextMatch = routeNodes.find((node) => node.status === 'current' && node.type === 'match');
    const isMercatoOpen = routeNodes.some((node) => node.status === 'current' && node.type === 'mercato');
    const matchLocation = 'Domicile';

    const handlePlayMatch = () => {
        FlowService.getInstance().navigateTo(GameState.MATCH_SIM);
    };

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
                                <span className="h-1 w-1 rounded-full bg-[#39ff14] shadow-[0_0_5px_#39ff14]" />
                                <span className="text-[#39ff14]">{prestige.toLocaleString('fr-FR')} credits</span>
                            </div>
                        </div>
                    </div>

                    <label className="sr-only" htmlFor="language-select">Langue</label>
                    <select
                        id="language-select"
                        className="h-10 rounded border border-white/10 bg-black/40 px-3 text-[11px] font-black uppercase tracking-widest text-white/70 outline-none transition-colors hover:border-[#39ff14]/50 focus:border-[#39ff14]"
                        defaultValue="fr"
                    >
                        <option value="fr">FR</option>
                        <option value="en">EN</option>
                        <option value="es">ES</option>
                    </select>
                </header>

                <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <ProgressPanel label="Moral de l'equipe" value={moraleScore} status={morale} tone="positive" />
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-inner backdrop-blur-2xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">Serie en cours</p>
                        <div className="mt-4 flex items-center justify-between gap-2">
                            {streak.slice(-5).map((result, index) => {
                                const label = resultLabels[result] ?? result;
                                const color = label === 'V' ? 'text-[#39ff14]' : label === 'D' ? 'text-red-400' : 'text-white/55';

                                return (
                                    <React.Fragment key={`${result}-${index}`}>
                                        {index > 0 && <span className="text-white/15">-</span>}
                                        <span className={`text-2xl font-black leading-none ${color}`}>{label}</span>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                    <ProgressPanel label="Fatigue de l'equipe" value={fatigueAvg} status={`${fatigueAvg}%`} tone="warning" />
                </section>

                <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <button className="group min-h-48 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur-2xl transition-all hover:border-[#39ff14]/50 hover:bg-[#39ff14]/5 active:scale-[0.99]">
                        <div className="flex h-full flex-col justify-between gap-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">Tactique</p>
                                    <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">{formation}</h2>
                                </div>
                                <span className="material-symbols-outlined rounded bg-black/50 p-3 text-3xl text-[#39ff14] shadow-[0_0_14px_rgba(57,255,20,0.25)]">schema</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">Consigne</p>
                                    <p className="mt-1 text-lg font-black uppercase text-[#39ff14]">Pressing haut</p>
                                </div>
                                <span className="material-symbols-outlined text-white/30 transition-transform group-hover:translate-x-1">chevron_right</span>
                            </div>
                        </div>
                    </button>

                    <button className="group min-h-48 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur-2xl transition-all hover:border-[#39ff14]/50 hover:bg-[#39ff14]/5 active:scale-[0.99]">
                        <div className="flex h-full flex-col gap-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">Composition</p>
                                    <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-[#39ff14]">{overallRating}%</h2>
                                </div>
                                <span className="material-symbols-outlined rounded bg-black/50 p-3 text-3xl text-[#39ff14] shadow-[0_0_14px_rgba(57,255,20,0.25)]">groups</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-bold uppercase tracking-wide text-white/75 sm:grid-cols-3">
                                {startingEleven.map((player) => (
                                    <span key={player} className="truncate">{player}</span>
                                ))}
                            </div>
                            <div className="mt-auto border-t border-white/10 pt-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/30">Remplacants</p>
                                <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-wide text-white/45">{substitutes.join(' - ')}</p>
                            </div>
                        </div>
                    </button>
                </section>

                <button
                    onClick={handlePlayMatch}
                    className="group relative min-h-28 overflow-hidden rounded-xl bg-[#39ff14] px-6 py-5 text-black shadow-[0_0_40px_rgba(57,255,20,0.28)] transition-all hover:shadow-[0_0_60px_rgba(57,255,20,0.42)] active:scale-[0.99]"
                >
                    <div className="absolute inset-0 translate-x-[-100%] skew-x-[-45deg] bg-white/25 transition-transform duration-1000 group-hover:translate-x-[100%]" />
                    <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-5 text-left">
                            <span className="material-symbols-outlined rounded bg-black p-3 text-4xl text-[#39ff14]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                            <div>
                                <p className="text-4xl font-black uppercase italic leading-none tracking-tight">Play</p>
                                <p className="mt-2 text-[11px] font-black uppercase tracking-[0.28em] opacity-70">
                                    {teamName} - {matchLocation}
                                    {nextMatch?.opponent ? ` vs ${nextMatch.opponent}` : ''}
                                </p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-4xl transition-transform group-hover:translate-x-2">chevron_right</span>
                    </div>
                </button>

                <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <ActionTile icon="shopping_cart" title="Boutique" subtitle="Acheter de l'equipement" />
                    <ActionTile
                        disabled={!isMercatoOpen}
                        icon="swap_horiz"
                        title="Mercato"
                        subtitle={isMercatoOpen ? 'Vendre ou drafter des joueurs' : 'Hors periode de mercato'}
                    />
                </section>
            </main>
        </div>
    );
};

interface ProgressPanelProps {
    label: string;
    value: number;
    status: string;
    tone: 'positive' | 'warning';
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({ label, value, status, tone }) => {
    const activeColor = tone === 'positive' ? 'bg-[#39ff14] shadow-[0_0_10px_#39ff14]' : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]';
    const statusColor = tone === 'positive' ? 'text-[#39ff14]' : 'text-amber-300';

    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-inner backdrop-blur-2xl">
            <div className="mb-4 flex items-end justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">{label}</p>
                <p className={`text-sm font-black uppercase ${statusColor}`}>{status}</p>
            </div>
            <div className="flex h-2 gap-1">
                {Array.from({ length: 20 }).map((_, index) => (
                    <div
                        key={index}
                        className={`flex-1 rounded-full transition-all ${index < Math.round(value / 5) ? activeColor : 'bg-white/5'}`}
                    />
                ))}
            </div>
        </div>
    );
};

interface ActionTileProps {
    icon: string;
    title: string;
    subtitle: string;
    disabled?: boolean;
}

const ActionTile: React.FC<ActionTileProps> = ({ icon, title, subtitle, disabled }) => (
    <button
        disabled={disabled}
        className={`min-h-28 rounded-xl border p-5 text-left backdrop-blur-2xl transition-all active:scale-[0.99] ${
            disabled
                ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-white/25 grayscale'
                : 'border-white/10 bg-white/[0.03] text-white hover:border-[#39ff14]/50 hover:bg-[#39ff14]/5'
        }`}
    >
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-2xl font-black uppercase tracking-tight">{title}</p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/40">{subtitle}</p>
            </div>
            <span className={`material-symbols-outlined rounded bg-black/50 p-3 text-3xl ${disabled ? 'text-white/20' : 'text-[#39ff14]'}`}>{icon}</span>
        </div>
    </button>
);

export default HubScreen;
