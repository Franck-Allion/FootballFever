import {
    DragDropProvider,
    DragOverlay,
    useDraggable,
    useDroppable,
} from '@dnd-kit/react';
import React, { useEffect, useMemo, useState } from 'react';

import { GameState } from '@core/fsm/GameState';
import { FlowService } from '@core/fsm/FlowService';
import { useTranslation } from '../../hooks/useTranslation';
import { type Player } from '@domains/shared/schemas/EntitySchemas';
import {
    type AssignmentDestination,
    type BenchSlot,
    type Eligibility,
    type FormationSlot,
    LineupService,
} from '@domains/shared/services/LineupService';
import { TacticalInstructionService, type TacticalInstructionId } from '@domains/shared/services/TacticalInstructionService';
import { useSquadStore } from '@domains/shared/store/useSquadStore';

type PlayerGroup = 'goalkeepers' | 'defenders' | 'midfielders' | 'attackers';
type DetailTab = 'resume' | 'stats' | 'forme';
type StatsSubTab = 'technique' | 'mental';

const rarityTextClasses: Record<string, string> = {
    Common: 'text-zinc-400',
    Rare: 'text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]',
    Epic: 'text-purple-300 drop-shadow-[0_0_8px_rgba(216,180,254,0.5)]',
    Legendary: 'text-amber-200 drop-shadow-[0_0_10px_rgba(252,211,77,0.6)]',
};

const rarityBorderClasses: Record<string, string> = {
    Common: 'border-white/10 shadow-inner',
    Rare: 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2),inset_0_0_10px_rgba(59,130,246,0.1)]',
    Epic: 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2),inset_0_0_10px_rgba(168,85,247,0.1)]',
    Legendary: 'border-amber-400/60 shadow-[0_0_20px_rgba(234,179,8,0.25),inset_0_0_12px_rgba(234,179,8,0.15)]',
};

const rarityBgClasses: Record<string, string> = {
    Common: 'bg-gradient-to-br from-zinc-900 to-zinc-950',
    Rare: 'bg-gradient-to-br from-blue-950 to-zinc-950',
    Epic: 'bg-gradient-to-br from-purple-950 to-zinc-950',
    Legendary: 'bg-gradient-to-br from-amber-900/40 to-yellow-600/20 backdrop-blur-md',
};

const eligibilityClasses: Record<Eligibility, string> = {
    best: 'border-[#39ff14] bg-[#39ff14]/12 shadow-[0_0_18px_rgba(57,255,20,0.25)]',
    adapted: 'border-amber-400 bg-amber-400/12 shadow-[0_0_18px_rgba(251,191,36,0.18)]',
    invalid: 'border-red-500 bg-red-500/10 shadow-[0_0_18px_rgba(239,68,68,0.16)]',
};

const haloClasses: Record<Eligibility, string> = {
    best: 'bg-[#39ff14] shadow-[0_0_18px_rgba(57,255,20,0.85)]',
    adapted: 'bg-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.7)]',
    invalid: 'bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.75)]',
};

const groupLabels: Record<PlayerGroup, string> = {
    goalkeepers: 'tactics.goalkeepers',
    defenders: 'tactics.defenders',
    midfielders: 'tactics.midfielders',
    attackers: 'tactics.attackers',
};

const statItems = [
    ['Gen', 'overallRating'],
    ['Att', 'attack'],
    ['Mil', 'midfield'],
    ['Def', 'defense'],
    ['End', 'staminaAvg'],
    ['Mor', 'morale'],
] as const;

const getDisplayName = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
        return parts[parts.length - 1];
    }
    return name;
};

const getPlayerGroup = (player: Player): PlayerGroup => {
    if (player.mainPosition === 'GK') return 'goalkeepers';
    if (['LB', 'CB', 'RB', 'LWB', 'RWB'].includes(player.mainPosition)) return 'defenders';
    if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(player.mainPosition)) return 'midfielders';

    return 'attackers';
};

const readDragData = (entry: unknown): Record<string, unknown> => {
    const candidate = entry as { data?: Record<string, unknown> | { current?: Record<string, unknown> } } | undefined;
    if (!candidate) return {};
    
    // In @dnd-kit/react, data is usually directly on the entry or in entry.data
    // In @dnd-kit/core, it was in entry.data.current
    const data = candidate.data ?? candidate;
    if (typeof data === 'object' && data !== null && 'current' in data) {
        return (data as { current: Record<string, unknown> }).current ?? {};
    }

    return (data as Record<string, unknown>) ?? {};
};

const readEventSource = (event: unknown): unknown => {
    const candidate = event as { operation?: { source?: unknown }; source?: unknown; active?: unknown };

    return candidate.active ?? candidate.operation?.source ?? candidate.source;
};

const readEventTarget = (event: unknown): unknown => {
    const candidate = event as { operation?: { target?: unknown }; target?: unknown; over?: unknown };

    return candidate.over ?? candidate.operation?.target ?? candidate.target;
};

const readEntityId = (entry: unknown): string | null => {
    const candidate = entry as { id?: unknown; identifier?: unknown } | undefined;
    const id = candidate?.id ?? candidate?.identifier;

    return typeof id === 'string' ? id : null;
};

const readEntityElement = (entry: unknown): Element | null => {
    if (typeof Element === 'undefined') return null;

    const candidate = entry as { element?: unknown } | undefined;
    return candidate?.element instanceof Element ? candidate.element : null;
};

const readPointerCoordinates = (event: unknown): { x: number; y: number } | null => {
    const candidate = event as {
        nativeEvent?: unknown;
        operation?: { position?: { current?: { x?: unknown; y?: unknown } } };
    };
    const position = candidate.operation?.position?.current;

    if (typeof position?.x === 'number' && typeof position.y === 'number') {
        return { x: position.x, y: position.y };
    }

    const nativeEvent = candidate.nativeEvent as { 
        clientX?: unknown; 
        clientY?: unknown;
        touches?: { clientX: number; clientY: number }[];
        changedTouches?: { clientX: number; clientY: number }[];
    } | undefined;

    if (nativeEvent?.touches && nativeEvent.touches.length > 0) {
        return { x: nativeEvent.touches[0]!.clientX, y: nativeEvent.touches[0]!.clientY };
    }

    if (nativeEvent?.changedTouches && nativeEvent.changedTouches.length > 0) {
        return { x: nativeEvent.changedTouches[0]!.clientX, y: nativeEvent.changedTouches[0]!.clientY };
    }

    if (typeof nativeEvent?.clientX === 'number' && typeof nativeEvent.clientY === 'number') {
        return { x: nativeEvent.clientX, y: nativeEvent.clientY };
    }

    return null;
};

const parseDestinationId = (id: string | null): AssignmentDestination | undefined => {
    if (!id) return undefined;

    if (id.startsWith('pitch-')) {
        return { area: 'pitch', slotId: id.replace(/^pitch-/, '') };
    }

    if (id.startsWith('bench-')) {
        return { area: 'bench', slotId: id.replace(/^bench-/, '') };
    }

    return undefined;
};

interface DraggablePlayerProps {
    player: Player;
    selected: boolean;
    compact?: boolean;
    placementStatus?: Eligibility;
    onSelect: (playerId: string) => void;
}

interface PlayerChipProps {
    player: Player;
    compact?: boolean;
    selected?: boolean;
    isDragging?: boolean;
    slot?: FormationSlot | BenchSlot; // Added to calculate context-aware rating
    placementStatus?: Eligibility;
    onSelect?: (playerId: string) => void;
}

const PlayerChip: React.FC<PlayerChipProps> = ({ 
    player, 
    compact, 
    selected, 
    isDragging, 
    slot,
    placementStatus, 
    onSelect
}) => {
    const displayName = useMemo(() => getDisplayName(player.name), [player.name]);
    
    // Calculate context-aware rating if a slot is provided
    const displayRating = useMemo(() => {
        if (!slot) return player.overallRating;
        return LineupService.getAdjustedRating(player, slot);
    }, [player, slot]);

    const isPenalized = slot && displayRating < player.overallRating;
    
    return (
        <div
            className={`group relative flex min-w-0 touch-none select-none overflow-hidden transition-all duration-300 ${
                compact
                    ? 'h-[clamp(38px,10vw,48px)] w-[clamp(42px,12vw,50px)] flex-col rounded-md border-b-2 sm:h-[clamp(52px,9vw,64px)] sm:w-[clamp(74px,12vw,92px)]'
                    : 'h-12 w-full items-center gap-2 rounded-lg border px-2'
            } ${rarityBgClasses[player.rarity] ?? rarityBgClasses.Common} ${
                rarityBorderClasses[player.rarity] ?? rarityBorderClasses.Common
            } ${
                selected ? 'ring-2 ring-[#39ff14] z-20 shadow-[0_0_20px_rgba(57,255,20,0.3)]' : ''
            } ${
                isPenalized ? 'ring-2 ring-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)] z-10' : ''
            } ${isDragging ? 'opacity-0 scale-95' : 'hover:brightness-110 active:scale-95'}`}
        >
            {/* Glossy Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50" />
            <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/4 skew-x-[35deg] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-1000 group-hover:left-[150%]" />

            {compact ? (
                // PITCH/BENCH COMPACT DESIGN
                <div className="flex flex-col h-full w-full">
                    {/* Header: Rating & Penalty Indicators (Top Left Corner Badge - Absolute) */}
                    <div className={`absolute left-0 top-0 z-20 flex min-w-[18px] items-center justify-center gap-0.5 rounded-br-lg border-r border-b border-white/10 px-1 py-0.5 shadow-lg backdrop-blur-md sm:min-w-[28px] sm:gap-1 sm:px-1.5 ${
                        isPenalized ? 'bg-red-600 animate-pulse' : 'bg-black/80'
                    }`}>
                        <span className="text-[9px] font-black leading-none tracking-tighter text-white sm:text-[12px]">
                            {displayRating}
                        </span>
                        {isPenalized && (
                            <span className="material-symbols-outlined text-[10px] font-bold text-white">
                                arrow_downward
                            </span>
                        )}
                    </div>

                    {/* Body: Portrait (Larger, centered) */}
                    <div className="relative flex-1 flex justify-center items-end overflow-hidden pt-1">
                        <img 
                            src={player.portraitUrl || '/assets/portraits/default.png'} 
                            alt="" 
                            className="h-[110%] w-auto object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-110"
                            draggable={false}
                        />
                    </div>

                    {/* Footer: Name & Natural Position Badge */}
                    <div className="flex items-center gap-0.5 bg-black/60 px-0.5 py-0.5 backdrop-blur-md sm:gap-1 sm:px-1 sm:py-1">
                        <span className="block flex-1 truncate text-center text-[7px] font-black uppercase leading-none tracking-tight text-white drop-shadow-md sm:text-[10px]">
                            {displayName}
                        </span>
                        <span className="shrink-0 rounded-sm border border-white/5 bg-white/10 px-0.5 py-0.5 text-[6px] font-black uppercase leading-none text-white/70 sm:px-1 sm:text-[7px]">
                            {player.mainPosition}
                        </span>
                    </div>
                </div>
            ) : (
                // LIST FULL DESIGN
                <>
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-black/40 border border-white/10">
                        <img 
                            src={player.portraitUrl || '/assets/portraits/default.png'} 
                            alt="" 
                            className="h-full w-full object-cover"
                            draggable={false}
                        />
                        <div className="absolute bottom-0 right-0 bg-black/80 px-1 text-[8px] font-black leading-tight text-white">
                            {player.overallRating}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`truncate font-black uppercase text-[11px] sm:text-[13px] leading-tight tracking-tight ${rarityTextClasses[player.rarity]}`}>
                                {player.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">
                                {player.mainPosition}
                            </span>
                            <span className={`text-[8px] font-black px-1 rounded-sm bg-white/5 leading-none uppercase ${rarityTextClasses[player.rarity]}`}>
                                {player.rarity}
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* Info Button - Sleek and subtle */}
            <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
                onClick={(event) => {
                    event.stopPropagation();
                    onSelect?.(player.id);
                }}
                className={`absolute bottom-1 right-1 z-10 flex items-center justify-center rounded-full bg-black/60 text-white/40 transition-all duration-200 hover:bg-[#39ff14] hover:text-black ${
                    compact ? 'h-4 w-4 opacity-0 group-hover:opacity-100' : 'h-6 w-6'
                }`}
                aria-label={`Afficher les statistiques de ${player.name}`}
            >
                <span className="material-symbols-outlined text-[12px] sm:text-[14px]">
                    {compact ? 'expand_less' : 'info'}
                </span>
            </button>

            {/* Eligibility Glow Overlay */}
            {placementStatus && (
                <div className={`pointer-events-none absolute inset-0 border-2 rounded-md ${
                    placementStatus === 'best' ? 'border-[#39ff14]/40 animate-pulse' : 
                    placementStatus === 'adapted' ? 'border-amber-400/40' : 'border-red-500/40'
                }`} />
            )}
        </div>
    );
};

const DraggablePlayer: React.FC<DraggablePlayerProps & { slot?: FormationSlot | BenchSlot }> = ({ 
    player, 
    selected, 
    compact = false, 
    placementStatus, 
    slot,
    onSelect 
}) => {
    const { ref, isDragging } = useDraggable({
        id: `player-${player.id}`,
        type: 'player',
        data: { playerId: player.id },
    } as never);
    
    return (
        <div ref={ref} className="touch-none select-none">
            <PlayerChip 
                player={player}
                selected={selected}
                compact={compact}
                isDragging={isDragging}
                slot={slot}
                placementStatus={placementStatus}
                onSelect={onSelect}
            />
        </div>
    );
};

interface DroppableSlotProps {
    destination: AssignmentDestination;
    player: Player | null;
    slot: FormationSlot | BenchSlot;
    draggedPlayer: Player | null;
    selectedPlayerId: string | null;
    onSelectPlayer: (playerId: string) => void;
    onPlaceSelectedPlayer: (destination: AssignmentDestination) => void;
    bench?: boolean;
}

const positionDescriptions: Record<string, string> = {
    GK: 'Gardien',
    LB: 'Défenseur Gauche',
    CB: 'Défenseur Central',
    RB: 'Défenseur Droit',
    LWB: 'Piston Gauche',
    RWB: 'Piston Droit',
    CDM: 'Milieu Défensif',
    CM: 'Milieu Central',
    CAM: 'Milieu Offensif',
    LM: 'Milieu Gauche',
    RM: 'Milieu Droit',
    LW: 'Attaquant Gauche',
    RW: 'Attaquant Droit',
    ST: 'Buteur',
    CF: 'Attaquant',
};

const roleColors: Record<string, { text: string; bg: string; border: string }> = {
    GK: { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
    DEF: { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
    MID: { text: 'text-[#39ff14]', bg: 'bg-[#39ff14]/10', border: 'border-[#39ff14]/30' },
    ATT: { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
    FIELD: { text: 'text-zinc-400', bg: 'bg-white/5', border: 'border-white/20' },
};

const DroppableSlot: React.FC<DroppableSlotProps> = ({
    destination,
    player,
    slot,
    draggedPlayer,
    selectedPlayerId,
    onSelectPlayer,
    onPlaceSelectedPlayer,
    bench = false,
}) => {
    const { t } = useTranslation();
    const { ref, isDropTarget } = useDroppable({
        id: `${destination.area}-${destination.slotId}`,
        accept: 'player',
        data: { destination },
    } as never);
    
    const dragEligibility = draggedPlayer ? LineupService.getPositionEligibility(draggedPlayer, slot) : null;
    const placementStatus = player ? LineupService.getPositionEligibility(player, slot) : null;
    const feedbackClass = dragEligibility ? eligibilityClasses[dragEligibility] : 'border-white/10 bg-black/38';

    const role = 'position' in slot ? slot.role : (slot.accepts === 'GK' ? 'GK' : 'FIELD');
    const colors = roleColors[role] || roleColors.GK;

    return (
        <div
            ref={ref}
            onClick={() => onPlaceSelectedPlayer(destination)}
            className={`relative flex flex-col items-stretch transition-all ${isDropTarget ? 'scale-[1.04]' : ''}`}
            data-testid={`${destination.area}-${destination.slotId}`}
        >
            {/* 1. Tactical Requirement Header (Flow-based, Above the Card) */}
            <div className={`z-30 flex items-center justify-between rounded-t-md border-t border-x border-white/10 bg-[#0a0c0a]/90 px-1.5 py-0.5 shadow-lg backdrop-blur-md`}>
                <span className={`text-[8px] font-black uppercase leading-none tracking-wider ${colors.text}`}>
                    {slot.label}
                </span>
                <span className="text-[6px] font-bold text-white/20 uppercase tracking-tighter truncate ml-1">
                    {positionDescriptions[slot.label]?.split(' ')[0] || ('id' in slot && slot.id.startsWith('bench') ? t('tactics.empty').toLowerCase() : 'Rôle')}
                </span>
            </div>

            {/* 2. Player Card / Empty Slot Container */}
            <div className={`relative flex items-center justify-center rounded-b-lg border-x border-b p-0.5 transition-all ${feedbackClass} ${
                bench ? 'h-full min-h-11 sm:min-h-14' : 'min-h-[clamp(42px,11vw,54px)] sm:min-h-[clamp(56px,10vw,70px)]'
            }`}>
                {player ? (
                    <DraggablePlayer
                        player={player}
                        selected={selectedPlayerId === player.id}
                        compact
                        slot={slot}
                        placementStatus={placementStatus ?? undefined}
                        onSelect={onSelectPlayer}
                    />
                ) : (
                    <div className={`flex h-[clamp(38px,10vw,48px)] w-full flex-col items-center justify-center rounded-md border border-dashed border-white/5 bg-white/[0.01] transition-colors sm:h-[clamp(52px,9vw,64px)] ${isDropTarget ? 'bg-white/5' : ''}`}>
                        <span className="text-[7px] font-black uppercase tracking-widest text-white/5 sm:text-[9px]">
                            {t('tactics.empty')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

interface PlayerDetailsProps {
    player: Player;
    tab: DetailTab;
    sourceArea?: 'squad' | 'pitch' | 'bench';
    onTabChange: (tab: DetailTab) => void;
    onClose: () => void;
}

const PlayerDetails: React.FC<PlayerDetailsProps> = ({ player, tab, sourceArea = 'squad', onTabChange, onClose }) => {
    const { t } = useTranslation();
    const [statsSubTab, setStatsSubTab] = useState<StatsSubTab>('technique');
    const { lineupSlots, benchSlots, formation } = useSquadStore();

    const secondary = player.secondaryPositions.length > 0 ? player.secondaryPositions.join(', ') : 'Aucun';
    const isCentered = sourceArea === 'pitch' || sourceArea === 'bench';

    // Find the current slot for context-aware rating
    const currentSlot = useMemo(() => {
        if (sourceArea === 'pitch') {
            const slotId = Object.entries(lineupSlots).find(([, id]) => id === player.id)?.[0];
            return slotId ? LineupService.getFormationSlots(formation).find((s) => s.id === slotId) : undefined;
        }
        if (sourceArea === 'bench') {
            const slotId = Object.entries(benchSlots).find(([, id]) => id === player.id)?.[0];
            return slotId ? LineupService.getBenchSlots().find((s) => s.id === slotId) : undefined;
        }
        return undefined;
    }, [player.id, sourceArea, lineupSlots, benchSlots, formation]);

    const displayRating = useMemo(() => {
        if (!currentSlot) return player.overallRating;
        return LineupService.getAdjustedRating(player, currentSlot);
    }, [player, currentSlot]);

    const isPenalized = currentSlot && displayRating < player.overallRating;

    // Split stats into two groups
    const statsGroups = useMemo(() => {
        const entries = Object.entries(player.stats).filter(([, v]) => typeof v === 'number') as [string, number][];
        
        if (player.mainPosition === 'GK') {
            return {
                technique: entries.filter(([k]) => ['lineSaving', 'reflexes', 'diving', 'oneOnOne', 'aerialClaim', 'cornerClaim'].includes(k)),
                mental: entries.filter(([k]) => ['handDistribution', 'kicking', 'positioning', 'communication', 'composure'].includes(k))
            };
        }

        return {
            technique: entries.filter(([k]) => ['passing', 'vision', 'technique', 'dribbling', 'shooting', 'finishing', 'clearance', 'tackling'].includes(k)),
            mental: entries.filter(([k]) => ['positioning', 'marking', 'pace', 'acceleration', 'stamina', 'power', 'duels', 'heading', 'composure'].includes(k))
        };
    }, [player.stats, player.mainPosition]);

    const containerClasses = isCentered
        ? 'fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-white/20 bg-[#0a0c0a]/98 shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_30px_rgba(57,255,20,0.15)] backdrop-blur-2xl'
        : 'mt-1 w-full rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-300';

    const content = (
        <div className="flex flex-col">
            {/* Header - Only shown when centered/modal (pitch/bench) to avoid redundancy in squad list */}
            {isCentered && (
                <div className={`flex items-center gap-3 border-b border-white/10 p-3 ${rarityBgClasses[player.rarity] || 'bg-zinc-900/50'}`}>
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-white/20 bg-black shadow-lg">
                        <img src={player.portraitUrl || '/assets/portraits/default.png'} alt="" className="h-full w-full object-cover" />
                        <div className={`absolute bottom-0 right-0 px-1.5 py-0.5 text-[10px] font-black leading-none ${
                            isPenalized ? 'bg-red-600 text-white animate-pulse' : 'bg-[#39ff14] text-black'
                        }`}>
                            {displayRating}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className={`truncate text-lg font-black uppercase leading-none tracking-tight ${rarityTextClasses[player.rarity]}`}>
                            {player.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                {player.mainPosition}
                            </span>
                            <div className="h-1 w-1 rounded-full bg-white/20" />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${rarityTextClasses[player.rarity]}`}>
                                {player.rarity}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/50 transition-all hover:border-[#39ff14]/50 hover:text-[#39ff14] hover:bg-black/60"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-black/20">
                {(['resume', 'stats', 'forme'] as DetailTab[]).map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onTabChange(item)}
                        className={`relative flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                            tab === item ? 'text-[#39ff14]' : 'text-white/40 hover:text-white/70'
                        }`}
                    >
                        {t(`tactics.tab_${item}`)}
                        {tab === item && (
                            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.8)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Sub-tabs for Stats */}
            {tab === 'stats' && (
                <div className="flex gap-4 px-4 py-2 bg-white/5 border-b border-white/5">
                    {(['technique', 'mental'] as StatsSubTab[]).map((sub) => (
                        <button
                            key={sub}
                            type="button"
                            onClick={() => setStatsSubTab(sub)}
                            className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                                statsSubTab === sub ? 'text-white' : 'text-white/30 hover:text-white/60'
                            }`}
                        >
                            {sub === 'technique' ? 'Technique' : 'Physique & Mental'}
                        </button>
                    ))}
                </div>
            )}

            {/* Content Area */}
            <div className={`${isCentered ? 'max-h-[380px] overflow-y-auto' : ''} p-1 sm:p-4 custom-scrollbar`}>
                {tab === 'resume' && (
                    <div className="grid grid-cols-2 gap-1 sm:gap-3">
                        <DetailStat label="Gén." value={displayRating} highlight />
                        <DetailStat label="Pos." value={player.mainPosition} />
                        <DetailStat label="Sec." value={secondary} wide />
                        <DetailStat label="Âge" value={`${player.age}a`} />
                        <DetailStat label="Val." value={`${(player.prestigeValue / 1000).toFixed(0)}k`} />
                    </div>
                )}
                {tab === 'stats' && (
                    <div className="grid grid-cols-1 gap-y-1 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-1.5">
                        {statsGroups[statsSubTab].map(([key, value]) => (
                            <StatBar key={key} statKey={key} value={value} />
                        ))}
                    </div>
                )}
                {tab === 'forme' && (
                    <div className="grid grid-cols-2 gap-1 sm:gap-3">
                        <DetailStat label="Moral" value={player.morale} progress />
                        <DetailStat label="Cond." value={player.condition} progress />
                        <DetailStat label="End." value={player.stamina} progress />
                        <DetailStat label="Niv." value={player.level} />
                        <DetailStat label="XP" value={player.xp} />
                        <DetailStat label="Pot." value={player.potential} progress />
                    </div>
                )}
            </div>
        </div>
    );

    if (isCentered) {
        return (
            <>
                <div 
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
                    onClick={onClose}
                />
                <section className={containerClasses}>
                    {content}
                </section>
            </>
        );
    }

    return (
        <section className={containerClasses}>
            {content}
        </section>
    );
};

const StatBar: React.FC<{ statKey: string; value: number }> = ({ statKey, value }) => {
    const labelMapping: Record<string, string> = {
        // Field
        tackling: 'Tacle', marking: 'Marq.', positioning: 'Plac.',
        passing: 'Passe', vision: 'Vis.', clearance: 'Dég.',
        technique: 'Tech.', dribbling: 'Drib.', pace: 'Vit.',
        acceleration: 'Acc.', stamina: 'End.', power: 'Puiss.',
        duels: 'Duels', heading: 'Tête', shooting: 'Tir',
        finishing: 'Fin.', composure: 'S.F.',
        // GK
        lineSaving: 'Ligne', reflexes: 'Réf.', diving: 'Plon.',
        oneOnOne: '1v1', aerialClaim: 'Air', cornerClaim: 'Corn.',
        handDistribution: 'Rel. M', kicking: 'Dég. P', communication: 'Com.'
    };

    return (
        <div className="group flex flex-col gap-0.5 rounded bg-white/[0.02] p-1 transition-colors hover:bg-white/10 sm:gap-1 sm:p-2">
            <div className="flex justify-between items-center px-0.5">
                <span className="text-[7px] font-black uppercase tracking-tight text-white/40 group-hover:text-white/80 transition-colors sm:text-[10px]">
                    {labelMapping[statKey] || statKey}
                </span>
                <span className={`text-[8px] font-black sm:text-[11px] ${
                    value > 85 ? 'text-[#39ff14]' : value > 70 ? 'text-blue-400' : value > 50 ? 'text-white' : 'text-red-400'
                }`}>
                    {value}
                </span>
            </div>
            <div className="h-0.5 w-full bg-black/40 rounded-full overflow-hidden sm:h-1.5">
                <div 
                    className={`h-full transition-all duration-700 ease-out ${
                        value > 85 ? 'bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.4)]' : 
                        value > 70 ? 'bg-blue-400' : 
                        value > 50 ? 'bg-zinc-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
};

const DetailStat: React.FC<{ 
    label: string; 
    value: string | number; 
    wide?: boolean; 
    highlight?: boolean;
    progress?: boolean;
}> = ({ label, value, wide = false, highlight = false, progress = false }) => (
    <div className={`relative flex flex-col justify-between overflow-hidden rounded-lg border border-white/5 bg-white/5 p-2.5 transition-colors hover:bg-white/10 ${wide ? 'col-span-2' : ''}`}>
        <div className="flex justify-between items-start gap-1">
            <p className="truncate text-[9px] font-black uppercase tracking-wider text-white/30">{label}</p>
            {highlight && <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.8)]" />}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
            <p className={`truncate text-base font-black tracking-tight ${highlight ? 'text-[#39ff14]' : 'text-white'}`}>
                {value}
            </p>
        </div>
        {progress && typeof value === 'number' && (
            <div className="mt-2 h-1 w-full rounded-full bg-black/40 overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 ${
                        value > 80 ? 'bg-[#39ff14]' : value > 50 ? 'bg-amber-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${value}%` }}
                />
            </div>
        )}
    </div>
);

interface SquadListZoneProps {
    groupedPlayers: Record<PlayerGroup, Player[]>;
    groupLabels: Record<PlayerGroup, string>;
    selectedPlayerId: string | null;
    selectedPlayer: Player | null;
    detailTab: DetailTab;
    onSelectPlayer: (playerId: string, area: 'squad' | 'pitch' | 'bench') => void;
    onTabChange: (tab: DetailTab) => void;
    onCloseDetails: () => void;
}

const SquadListZone: React.FC<SquadListZoneProps> = ({ 
    groupedPlayers, 
    groupLabels, 
    selectedPlayerId, 
    selectedPlayer,
    detailTab,
    onSelectPlayer, 
    onTabChange,
    onCloseDetails
}) => {
    const { t } = useTranslation();
    const { ref, isDropTarget } = useDroppable({
        id: 'squad-list-dropzone',
        accept: 'player',
        data: { destination: { area: 'unassign', slotId: 'root' } },
    } as never);

    return (
        <aside 
            ref={ref}
            className={`min-h-0 overflow-hidden rounded-xl border transition-all ${
                isDropTarget ? 'border-[#39ff14]/60 bg-[#39ff14]/5' : 'border-white/10 bg-white/[0.03]'
            } backdrop-blur-2xl`}
        >
            <div className="border-b border-white/10 px-2 py-2">
                <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{t('tactics.squad')}</p>
            </div>
            <div className="h-[calc(100%-37px)] overflow-y-auto px-1.5 py-2 custom-scrollbar">
                {(Object.keys(groupLabels) as PlayerGroup[]).map((group) => (
                    <section key={group} className="mb-3 last:mb-0">
                        <div className="mb-1 flex items-center justify-between gap-1">
                            <p className="truncate text-[8px] font-black uppercase tracking-[0.15em] text-white/35">{t(groupLabels[group])}</p>
                            <span className="text-[8px] font-black text-[#39ff14]/70">{groupedPlayers[group].length}</span>
                        </div>
                        <div className="space-y-1">
                            {groupedPlayers[group].map((player) => (
                                <div key={player.id} className="flex flex-col">
                                    <DraggablePlayer
                                        player={player}
                                        selected={selectedPlayerId === player.id}
                                        onSelect={(id) => onSelectPlayer(id, 'squad')}
                                    />
                                    {selectedPlayerId === player.id && selectedPlayer && (
                                        <PlayerDetails 
                                            player={selectedPlayer}
                                            tab={detailTab}
                                            sourceArea="squad"
                                            onTabChange={onTabChange}
                                            onClose={onCloseDetails}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </aside>
    );
};

const TacticsScreen: React.FC = () => {
    const { t } = useTranslation();
    const {
        formation,
        lineupSlots,
        benchSlots,
        gameInstruction,
        roster,
        overallRating,
        composites,
        staminaAvg,
        morale,
        initializeRoster,
        initializeLineup,
        setFormation,
        setGameInstruction,
    } = useSquadStore();
    
    const movePlayerToSlot = useSquadStore((s) => s.movePlayerToSlot);

    const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
    const [dragGhostOffset, setDragGhostOffset] = useState<{ x: number; y: number } | null>(null);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [selectedSourceArea, setSelectedSourceArea] = useState<'squad' | 'pitch' | 'bench' | null>(null);
    const [detailTab, setDetailTab] = useState<DetailTab>('resume');

    useEffect(() => {
        if (roster.length < 24) {
            initializeRoster(true);
            return;
        }

        initializeLineup();
    }, [initializeLineup, initializeRoster, roster.length]);

    const playersById = useMemo(() => new Map(roster.map((player) => [player.id, player])), [roster]);
    const formationSlots = useMemo(() => LineupService.getFormationSlots(formation), [formation]);
    const benchDefinitions = useMemo(() => LineupService.getBenchSlots(), []);
    const instructions = useMemo(() => TacticalInstructionService.getInstructions(), []);
    
    // Track assigned IDs to filter squad list
    const assignedIds = useMemo(() => {
        const ids = new Set<string>();
        Object.values(lineupSlots).forEach((id) => id && ids.add(id));
        Object.values(benchSlots).forEach((id) => id && ids.add(id));
        return ids;
    }, [lineupSlots, benchSlots]);

    const draggedPlayer = draggedPlayerId ? playersById.get(draggedPlayerId) ?? null : null;
    const selectedPlayer = selectedPlayerId ? playersById.get(selectedPlayerId) ?? null : null;
    
    const groupedPlayers = useMemo(() => {
        const groups: Record<PlayerGroup, Player[]> = {
            goalkeepers: [],
            defenders: [],
            midfielders: [],
            attackers: [],
        };

        roster
            .filter((p) => !assignedIds.has(p.id))
            .sort((left, right) => right.overallRating - left.overallRating)
            .forEach((player) => groups[getPlayerGroup(player)].push(player));

        return groups;
    }, [roster, assignedIds]);

    const stats: Record<(typeof statItems)[number][1], number> = {
        overallRating,
        attack: composites.attack,
        midfield: composites.midfield,
        defense: composites.defense,
        staminaAvg,
        morale,
    };

    const handleBack = () => {
        FlowService.getInstance().navigateTo(GameState.HUB);
    };

    const handleSelectPlayer = (playerId: string, area: 'squad' | 'pitch' | 'bench') => {
        if (selectedPlayerId === playerId && selectedSourceArea === area) {
            setSelectedPlayerId(null);
            setSelectedSourceArea(null);
        } else {
            setSelectedPlayerId(playerId);
            setSelectedSourceArea(area);
            setDetailTab('resume');
        }
    };

    const handlePlaceSelectedPlayer = (destination: AssignmentDestination) => {
        if (!selectedPlayerId) return;

        const moved = movePlayerToSlot(selectedPlayerId, destination);
        if (moved) {
            // After moving, keep it selected but update its position context
            setSelectedSourceArea(destination.area);
        }
    };

    const handleDragStart = (event: unknown) => {
        const source = readEventSource(event);
        const data = readDragData(source);
        const playerId = typeof data.playerId === 'string' ? data.playerId : null;
        const sourceElement = readEntityElement(source);
        const pointer = readPointerCoordinates(event);

        setDraggedPlayerId(playerId);
        if (sourceElement && pointer) {
            const rect = sourceElement.getBoundingClientRect();
            setDragGhostOffset({
                x: Math.min(Math.max(pointer.x - rect.left, 0), rect.width),
                y: Math.min(Math.max(pointer.y - rect.top, 0), rect.height),
            });
        } else {
            setDragGhostOffset(null);
        }
    };

    const handleDragEnd = (event: unknown) => {
        const source = readEventSource(event);
        const target = readEventTarget(event);
        const sourceData = readDragData(source);
        const targetData = readDragData(target);
        const sourceId = readEntityId(source);
        const targetId = readEntityId(target);
        const playerId = typeof sourceData.playerId === 'string'
            ? sourceData.playerId
            : sourceId?.replace(/^player-/, '') ?? draggedPlayerId;
        const destination = (targetData.destination as AssignmentDestination | undefined) ?? parseDestinationId(targetId);

        if (playerId && destination) {
            movePlayerToSlot(playerId, destination);
        }

        setDraggedPlayerId(null);
        setDragGhostOffset(null);
    };

    const handleDragCancel = () => {
        setDraggedPlayerId(null);
        setDragGhostOffset(null);
    };

    return (
        <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
            <div className="h-[100dvh] overflow-hidden bg-[#050505] font-['Space_Grotesk'] text-[#e3e2e2] selection:bg-[#39ff14]/30">
                <main className="flex h-full w-full flex-col gap-2 p-2 sm:gap-3 sm:p-3">
                    <header className="shrink-0 rounded-xl border border-white/10 bg-[#121212]/78 px-2 py-2 shadow-[0_4px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                        <div className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex h-10 w-10 items-center justify-center rounded border border-white/10 bg-black/45 text-white/70 transition-colors hover:border-[#39ff14]/60 hover:text-[#39ff14]"
                                aria-label={t('tactics.back_hub')}
                            >
                                <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span>
                            </button>
                            <label className="min-w-0">
                                <span className="sr-only">{t('tactics.formation_select')}</span>
                                <select
                                    value={formation}
                                    onChange={(event) => setFormation(event.target.value)}
                                    className="h-10 w-full rounded border border-[#39ff14]/35 bg-black/55 px-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#39ff14] outline-none focus:border-[#39ff14]"
                                    aria-label={t('tactics.formation_select')}
                                >
                                    {LineupService.getSupportedFormations().map((formationOption) => (
                                        <option key={formationOption} value={formationOption}>{formationOption}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="min-w-0">
                                <span className="sr-only">{t('tactics.instruction_select')}</span>
                                <select
                                    value={gameInstruction}
                                    onChange={(event) => setGameInstruction(event.target.value as TacticalInstructionId)}
                                    className="h-10 w-full rounded border border-white/10 bg-black/55 px-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/75 outline-none focus:border-[#39ff14]"
                                    aria-label={t('tactics.instruction_select')}
                                >
                                    {instructions.map((instruction) => (
                                        <option key={instruction.id} value={instruction.id}>{t(instruction.label)}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className="mt-2 grid grid-cols-6 gap-1">
                            {statItems.map(([label, key]) => (
                                <div key={key} className="min-w-0 border border-white/10 bg-black/35 px-1 py-1 text-center">
                                    <p className="truncate text-[7px] font-black uppercase tracking-[0.08em] text-white/35">{label}</p>
                                    <p className="text-[11px] font-black leading-tight text-white">{stats[key]}</p>
                                </div>
                            ))}
                        </div>
                    </header>

                    <section className="grid min-h-0 flex-1 grid-cols-[minmax(104px,32vw)_minmax(0,1fr)] gap-2 sm:grid-cols-[minmax(190px,25vw)_minmax(0,1fr)] sm:gap-3">
                        <SquadListZone 
                            groupedPlayers={groupedPlayers}
                            groupLabels={groupLabels}
                            selectedPlayerId={selectedPlayerId}
                            selectedPlayer={selectedSourceArea === 'squad' ? selectedPlayer : null}
                            detailTab={detailTab}
                            onSelectPlayer={handleSelectPlayer}
                            onTabChange={setDetailTab}
                            onCloseDetails={() => setSelectedPlayerId(null)}
                        />

                        <section className="flex min-h-0 flex-col gap-2">
                            <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-[#39ff14]/25 bg-[#09130d] shadow-[inset_0_0_60px_rgba(57,255,20,0.09)]">
                                <div className="absolute inset-x-5 top-1/2 h-px bg-white/10" aria-hidden="true" />
                                <div className="absolute left-1/2 top-1/2 h-[18%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" aria-hidden="true" />
                                <div className="absolute inset-x-[22%] bottom-0 h-[17%] border-x border-t border-white/10" aria-hidden="true" />
                                <div className="absolute inset-x-[22%] top-0 h-[17%] border-x border-b border-white/10" aria-hidden="true" />
                                <div className="absolute inset-y-3 left-1/2 w-px bg-[#39ff14]/10" aria-hidden="true" />

                                {formationSlots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className="absolute w-[clamp(42px,12vw,50px)] -translate-x-1/2 -translate-y-1/2 sm:w-[clamp(74px,12vw,92px)]"
                                        style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                                    >
                                        <DroppableSlot
                                            destination={{ area: 'pitch', slotId: slot.id }}
                                            player={lineupSlots[slot.id] ? playersById.get(lineupSlots[slot.id]!) ?? null : null}
                                            slot={slot}
                                            draggedPlayer={draggedPlayer}
                                            selectedPlayerId={selectedPlayerId}
                                            onSelectPlayer={(id) => handleSelectPlayer(id, 'pitch')}
                                            onPlaceSelectedPlayer={handlePlaceSelectedPlayer}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid h-[clamp(54px,13dvh,78px)] shrink-0 grid-cols-5 gap-0.5 rounded-xl border border-white/10 bg-white/[0.03] p-0.5 backdrop-blur-2xl sm:h-[clamp(64px,15dvh,96px)] sm:gap-1 sm:p-1">
                                {benchDefinitions.map((slot) => (
                                    <DroppableSlot
                                        key={slot.id}
                                        destination={{ area: 'bench', slotId: slot.id }}
                                        player={benchSlots[slot.id] ? playersById.get(benchSlots[slot.id]!) ?? null : null}
                                        slot={slot}
                                        draggedPlayer={draggedPlayer}
                                        selectedPlayerId={selectedPlayerId}
                                        onSelectPlayer={(id) => handleSelectPlayer(id, 'bench')}
                                        onPlaceSelectedPlayer={handlePlaceSelectedPlayer}
                                        bench
                                    />
                                ))}
                            </div>
                        </section>
                    </section>
                </main>

                {selectedPlayer && (selectedSourceArea === 'pitch' || selectedSourceArea === 'bench') && (
                    <PlayerDetails
                        player={selectedPlayer}
                        tab={detailTab}
                        sourceArea={selectedSourceArea}
                        onTabChange={setDetailTab}
                        onClose={() => setSelectedPlayerId(null)}
                    />
                )}

                <DragOverlay dropAnimation={null} className="pointer-events-none overflow-visible">
                    {draggedPlayer ? (
                        <div
                            className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2 scale-105 opacity-95 shadow-2xl shadow-black/80"
                            style={dragGhostOffset ? { left: dragGhostOffset.x, top: dragGhostOffset.y } : { left: '50%', top: '50%' }}
                        >
                            <PlayerChip player={draggedPlayer} compact />
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DragDropProvider>
    );
};

export default TacticsScreen;
