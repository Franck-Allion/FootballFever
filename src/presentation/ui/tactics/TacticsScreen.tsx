import {
    DragDropProvider,
    DragOverlay,
    useDraggable,
    useDroppable,
} from '@dnd-kit/react';
import React, { useEffect, useMemo, useState } from 'react';

import { GameState } from '@core/fsm/GameState';
import { FlowService } from '@core/fsm/FlowService';
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
    goalkeepers: 'Gardiens',
    defenders: 'Defenseurs',
    midfielders: 'Milieux',
    attackers: 'Attaquants',
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
    if (!candidate?.data) return {};
    if ('current' in candidate.data) return candidate.data.current ?? {};

    return candidate.data;
};

const readEventSource = (event: unknown): unknown => {
    const candidate = event as { operation?: { source?: unknown }; source?: unknown; active?: unknown };

    return candidate.operation?.source ?? candidate.source ?? candidate.active;
};

const readEventTarget = (event: unknown): unknown => {
    const candidate = event as { operation?: { target?: unknown }; target?: unknown; over?: unknown };

    return candidate.operation?.target ?? candidate.target ?? candidate.over;
};

const readEntityId = (entry: unknown): string | null => {
    const candidate = entry as { id?: unknown; identifier?: unknown } | undefined;
    const id = candidate?.id ?? candidate?.identifier;

    return typeof id === 'string' ? id : null;
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
    placementStatus?: Eligibility;
    onSelect?: (playerId: string) => void;
}

const PlayerChip: React.FC<PlayerChipProps> = ({ 
    player, 
    compact, 
    selected, 
    isDragging, 
    placementStatus, 
    onSelect
}) => {
    const displayName = useMemo(() => getDisplayName(player.name), [player.name]);
    
    return (
        <div
            className={`group relative flex min-w-0 touch-none select-none overflow-hidden transition-all duration-300 ${
                compact
                    ? 'h-[clamp(52px,9vw,64px)] w-[clamp(74px,12vw,92px)] flex-col rounded-md border-b-2'
                    : 'h-12 w-full items-center gap-2 rounded-lg border px-2'
            } ${rarityBgClasses[player.rarity] ?? rarityBgClasses.Common} ${
                rarityBorderClasses[player.rarity] ?? rarityBorderClasses.Common
            } ${
                selected ? 'ring-2 ring-[#39ff14] z-20 shadow-[0_0_20px_rgba(57,255,20,0.3)]' : ''
            } ${isDragging ? 'opacity-40 scale-95' : 'hover:brightness-110 active:scale-95'}`}
        >
            {/* Glossy Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50" />
            <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/4 skew-x-[35deg] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-1000 group-hover:left-[150%]" />

            {compact ? (
                // PITCH/BENCH COMPACT DESIGN
                <div className="flex flex-col h-full w-full">
                    {/* Header: Rating & Position */}
                    <div className="flex justify-between items-center px-1.5 py-0.5 bg-black/40 backdrop-blur-sm border-b border-white/5">
                        <span className="text-[10px] sm:text-[11px] font-black leading-none text-white tracking-tighter">
                            {player.overallRating}
                        </span>
                        <span className="text-[8px] font-black leading-none text-white/50 uppercase">
                            {player.mainPosition}
                        </span>
                    </div>

                    {/* Body: Portrait (Larger, centered) */}
                    <div className="relative flex-1 flex justify-center items-end overflow-hidden pt-1">
                        <img 
                            src={player.portraitUrl || '/assets/portraits/default.png'} 
                            alt="" 
                            className="h-[110%] w-auto object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-500" 
                        />
                    </div>

                    {/* Footer: Name (Maximum readability) */}
                    <div className="bg-black/60 px-1 py-1 backdrop-blur-md">
                        <span className="block truncate text-center font-black uppercase text-[9px] sm:text-[10px] leading-none tracking-tight text-white drop-shadow-md">
                            {displayName}
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
                className={`absolute right-1 bottom-1 z-10 flex items-center justify-center rounded-full bg-black/60 text-white/40 hover:bg-[#39ff14] hover:text-black transition-all duration-200 ${
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

const DraggablePlayer: React.FC<DraggablePlayerProps> = ({ player, selected, compact = false, placementStatus, onSelect }) => {
    const { 
        ref, 
        isDragging
    } = useDraggable({
        id: `player-${player.id}`,
        type: 'player',
        data: { playerId: player.id },
    } as never);
    
    return (
        <div ref={ref}>
            <PlayerChip 
                player={player}
                selected={selected}
                compact={compact}
                isDragging={isDragging}
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
    const { ref, isDropTarget } = useDroppable({
        id: `${destination.area}-${destination.slotId}`,
        accept: 'player',
        data: { destination },
    } as never);
    const dragEligibility = draggedPlayer ? LineupService.getPositionEligibility(draggedPlayer, slot) : null;
    const placementStatus = player ? LineupService.getPositionEligibility(player, slot) : null;
    const feedbackClass = dragEligibility ? eligibilityClasses[dragEligibility] : 'border-white/10 bg-black/38';

    return (
        <div
            ref={ref}
            onClick={() => onPlaceSelectedPlayer(destination)}
            className={`relative flex items-center justify-center rounded-lg border transition-all ${feedbackClass} ${isDropTarget ? 'scale-[1.04]' : ''} ${
                bench ? 'h-full min-h-14 p-0.5' : 'min-h-[clamp(56px,10vw,70px)] p-0.5'
            }`}
            data-testid={`${destination.area}-${destination.slotId}`}
        >
            <span className="pointer-events-none absolute left-1 top-0.5 z-10 text-[7px] font-black uppercase leading-none tracking-[0.08em] text-white/40">
                {slot.label}
            </span>
            {player ? (
                <DraggablePlayer
                    player={player}
                    selected={selectedPlayerId === player.id}
                    compact
                    placementStatus={placementStatus ?? undefined}
                    onSelect={onSelectPlayer}
                />
            ) : (
                <div className="h-[clamp(52px,9vw,64px)] w-[clamp(74px,12vw,92px)] rounded-md border border-dashed border-white/10 bg-white/[0.02]" />
            )}
        </div>
    );
};

interface PlayerDetailsProps {
    player: Player;
    tab: DetailTab;
    onTabChange: (tab: DetailTab) => void;
    onClose: () => void;
}

const PlayerDetails: React.FC<PlayerDetailsProps> = ({ player, tab, onTabChange, onClose }) => {
    const stats = Object.entries(player.stats).filter(([, value]) => typeof value === 'number');
    const secondary = player.secondaryPositions.length > 0 ? player.secondaryPositions.join(', ') : 'Aucun';

    return (
        <section className="fixed inset-x-2 bottom-2 z-50 max-h-[48dvh] overflow-hidden rounded-xl border border-[#39ff14]/35 bg-[#080a08]/95 shadow-[0_0_42px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:left-auto sm:right-4 sm:w-[380px]">
            <div className="flex items-center gap-2 border-b border-white/10 p-2">
                <span className="h-10 w-10 shrink-0 overflow-hidden rounded border border-white/10 bg-[#121212]">
                    <img src={player.portraitUrl || '/assets/portraits/default.png'} alt="" className="h-full w-full object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-black uppercase leading-tight ${rarityTextClasses[player.rarity] ?? rarityTextClasses.Common}`}>
                        {player.name}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
                        {player.mainPosition} / {player.rarity}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-black/45 text-white/65 hover:border-[#39ff14]/60 hover:text-[#39ff14]"
                    aria-label="Fermer les statistiques du joueur"
                >
                    <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
                </button>
            </div>
            <div className="grid grid-cols-3 border-b border-white/10">
                {(['resume', 'stats', 'forme'] as DetailTab[]).map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onTabChange(item)}
                        className={`h-9 text-[9px] font-black uppercase tracking-[0.18em] ${
                            tab === item ? 'bg-[#39ff14] text-black' : 'bg-black/30 text-white/55 hover:text-[#39ff14]'
                        }`}
                    >
                        {item}
                    </button>
                ))}
            </div>
            <div className="max-h-[calc(48dvh-92px)] overflow-y-auto p-3">
                {tab === 'resume' && (
                    <div className="grid grid-cols-2 gap-2">
                        <DetailStat label="Note" value={player.overallRating} />
                        <DetailStat label="Poste" value={player.mainPosition} />
                        <DetailStat label="Secondaire" value={secondary} wide />
                        <DetailStat label="Age" value={player.age} />
                        <DetailStat label="Valeur" value={player.prestigeValue.toLocaleString('fr-FR')} />
                    </div>
                )}
                {tab === 'stats' && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {stats.map(([key, value]) => (
                            <DetailStat key={key} label={key} value={value} />
                        ))}
                    </div>
                )}
                {tab === 'forme' && (
                    <div className="grid grid-cols-2 gap-2">
                        <DetailStat label="Moral" value={player.morale} />
                        <DetailStat label="Condition" value={player.condition} />
                        <DetailStat label="Endurance" value={player.stamina} />
                        <DetailStat label="Niveau" value={player.level} />
                        <DetailStat label="XP" value={player.xp} />
                        <DetailStat label="Potentiel" value={player.potential} />
                    </div>
                )}
            </div>
        </section>
    );
};

const DetailStat: React.FC<{ label: string; value: string | number; wide?: boolean }> = ({ label, value, wide = false }) => (
    <div className={`border border-white/10 bg-black/35 px-2 py-1.5 ${wide ? 'col-span-2' : ''}`}>
        <p className="truncate text-[8px] font-black uppercase tracking-[0.14em] text-white/35">{label}</p>
        <p className="truncate text-sm font-black text-white">{value}</p>
    </div>
);

interface SquadListZoneProps {
    groupedPlayers: Record<PlayerGroup, Player[]>;
    groupLabels: Record<PlayerGroup, string>;
    selectedPlayerId: string | null;
    onSelectPlayer: (playerId: string) => void;
}

const SquadListZone: React.FC<SquadListZoneProps> = ({ groupedPlayers, groupLabels, selectedPlayerId, onSelectPlayer }) => {
    const { ref, isDropTarget } = useDroppable({
        id: 'squad-list-dropzone',
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
                <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Effectif</p>
            </div>
            <div className="h-[calc(100%-37px)] overflow-y-auto px-1.5 py-2">
                {(Object.keys(groupLabels) as PlayerGroup[]).map((group) => (
                    <section key={group} className="mb-3 last:mb-0">
                        <div className="mb-1 flex items-center justify-between gap-1">
                            <p className="truncate text-[8px] font-black uppercase tracking-[0.15em] text-white/35">{groupLabels[group]}</p>
                            <span className="text-[8px] font-black text-[#39ff14]/70">{groupedPlayers[group].length}</span>
                        </div>
                        <div className="space-y-1">
                            {groupedPlayers[group].map((player) => (
                                <DraggablePlayer
                                    key={player.id}
                                    player={player}
                                    selected={selectedPlayerId === player.id}
                                    onSelect={onSelectPlayer}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </aside>
    );
};

const TacticsScreen: React.FC = () => {
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
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
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

    const handleSelectPlayer = (playerId: string) => {
        setSelectedPlayerId(playerId);
        setDetailTab('resume');
    };

    const handlePlaceSelectedPlayer = (destination: AssignmentDestination) => {
        if (!selectedPlayerId) return;

        const moved = movePlayerToSlot(selectedPlayerId, destination);
        if (moved) {
            setSelectedPlayerId(selectedPlayerId);
        }
    };

    const handleDragStart = (event: unknown) => {
        const source = readEventSource(event);
        const data = readDragData(source);
        const playerId = typeof data.playerId === 'string' ? data.playerId : null;

        setDraggedPlayerId(playerId);
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
    };

    const handleDragCancel = () => {
        setDraggedPlayerId(null);
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
                                aria-label="Retour au hub"
                            >
                                <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span>
                            </button>
                            <label className="min-w-0">
                                <span className="sr-only">Choisir la tactique</span>
                                <select
                                    value={formation}
                                    onChange={(event) => setFormation(event.target.value)}
                                    className="h-10 w-full rounded border border-[#39ff14]/35 bg-black/55 px-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#39ff14] outline-none focus:border-[#39ff14]"
                                    aria-label="Choisir la tactique"
                                >
                                    {LineupService.getSupportedFormations().map((formationOption) => (
                                        <option key={formationOption} value={formationOption}>{formationOption}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="min-w-0">
                                <span className="sr-only">Choisir la consigne</span>
                                <select
                                    value={gameInstruction}
                                    onChange={(event) => setGameInstruction(event.target.value as TacticalInstructionId)}
                                    className="h-10 w-full rounded border border-white/10 bg-black/55 px-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/75 outline-none focus:border-[#39ff14]"
                                    aria-label="Choisir la consigne"
                                >
                                    {instructions.map((instruction) => (
                                        <option key={instruction.id} value={instruction.id}>{instruction.label}</option>
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

                    <section className="grid min-h-0 flex-1 grid-cols-[minmax(108px,34vw)_minmax(0,1fr)] gap-2 sm:grid-cols-[minmax(190px,25vw)_minmax(0,1fr)] sm:gap-3">
                        <SquadListZone 
                            groupedPlayers={groupedPlayers}
                            groupLabels={groupLabels}
                            selectedPlayerId={selectedPlayerId}
                            onSelectPlayer={handleSelectPlayer}
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
                                        className="absolute w-[clamp(74px,12vw,92px)] -translate-x-1/2 -translate-y-1/2"
                                        style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                                    >
                                        <DroppableSlot
                                            destination={{ area: 'pitch', slotId: slot.id }}
                                            player={lineupSlots[slot.id] ? playersById.get(lineupSlots[slot.id]!) ?? null : null}
                                            slot={slot}
                                            draggedPlayer={draggedPlayer}
                                            selectedPlayerId={selectedPlayerId}
                                            onSelectPlayer={handleSelectPlayer}
                                            onPlaceSelectedPlayer={handlePlaceSelectedPlayer}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid h-[clamp(64px,15dvh,96px)] shrink-0 grid-cols-5 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 backdrop-blur-2xl">
                                {benchDefinitions.map((slot) => (
                                    <DroppableSlot
                                        key={slot.id}
                                        destination={{ area: 'bench', slotId: slot.id }}
                                        player={benchSlots[slot.id] ? playersById.get(benchSlots[slot.id]!) ?? null : null}
                                        slot={slot}
                                        draggedPlayer={draggedPlayer}
                                        selectedPlayerId={selectedPlayerId}
                                        onSelectPlayer={handleSelectPlayer}
                                        onPlaceSelectedPlayer={handlePlaceSelectedPlayer}
                                        bench
                                    />
                                ))}
                            </div>
                        </section>
                    </section>
                </main>

                {selectedPlayer && (
                    <PlayerDetails
                        player={selectedPlayer}
                        tab={detailTab}
                        onTabChange={setDetailTab}
                        onClose={() => setSelectedPlayerId(null)}
                    />
                )}

                <DragOverlay dropAnimation={null}>
                    {draggedPlayer ? (
                        <div className="z-50 scale-105 opacity-80 shadow-2xl shadow-black/80">
                            <PlayerChip player={draggedPlayer} compact />
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DragDropProvider>
    );
};

export default TacticsScreen;
