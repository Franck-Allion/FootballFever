import { type Player } from '../schemas/EntitySchemas';
import { type RatedLineupPlayer, type RatingPosition, TeamRatingService } from './TeamRatingService';

export type AssignmentMap = Record<string, string | null>;
export type AssignmentArea = 'pitch' | 'bench' | 'unassign';
export type Eligibility = 'best' | 'secondary' | 'adapted' | 'invalid';
export type SlotRole = 'GK' | 'DEF' | 'MID' | 'ATT';

export interface FormationSlot {
    id: string;
    label: string;
    position: RatingPosition;
    role: SlotRole;
    x: number;
    y: number;
}

export interface BenchSlot {
    id: string;
    label: string;
    accepts: 'GK' | 'FIELD';
}

export interface AssignmentDestination {
    area: AssignmentArea;
    slotId: string;
}

export interface MovePlayerInput {
    roster: Player[];
    formation: string;
    lineupSlots: AssignmentMap;
    benchSlots: AssignmentMap;
    playerId: string;
    destination: AssignmentDestination;
}

export interface MovePlayerResult {
    moved: boolean;
    lineupSlots: AssignmentMap;
    benchSlots: AssignmentMap;
}

export interface RemapFormationInput {
    roster: Player[];
    fromFormation: string;
    toFormation: string;
    lineupSlots: AssignmentMap;
    benchSlots: AssignmentMap;
}

const FORMATIONS: Record<string, FormationSlot[]> = {
    '4-4-2 DIAMOND': [
        { id: 'gk', label: 'GK', position: 'GK', role: 'GK', x: 50, y: 88 },
        { id: 'lb', label: 'LB', position: 'LB', role: 'DEF', x: 18, y: 68 },
        { id: 'cb-l', label: 'CB', position: 'CB', role: 'DEF', x: 38, y: 70 },
        { id: 'cb-r', label: 'CB', position: 'CB', role: 'DEF', x: 62, y: 70 },
        { id: 'rb', label: 'RB', position: 'RB', role: 'DEF', x: 82, y: 68 },
        { id: 'cdm', label: 'CDM', position: 'CDM', role: 'MID', x: 50, y: 55 },
        { id: 'cm-l', label: 'CM', position: 'CM', role: 'MID', x: 35, y: 43 },
        { id: 'cm-r', label: 'CM', position: 'CM', role: 'MID', x: 65, y: 43 },
        { id: 'cam', label: 'CAM', position: 'CAM', role: 'MID', x: 50, y: 30 },
        { id: 'st-l', label: 'ST', position: 'ST', role: 'ATT', x: 40, y: 15 },
        { id: 'st-r', label: 'ST', position: 'ST', role: 'ATT', x: 60, y: 15 },
    ],
    '4-3-3': [
        { id: 'gk', label: 'GK', position: 'GK', role: 'GK', x: 50, y: 88 },
        { id: 'lb', label: 'LB', position: 'LB', role: 'DEF', x: 16, y: 68 },
        { id: 'cb-l', label: 'CB', position: 'CB', role: 'DEF', x: 38, y: 70 },
        { id: 'cb-r', label: 'CB', position: 'CB', role: 'DEF', x: 62, y: 70 },
        { id: 'rb', label: 'RB', position: 'RB', role: 'DEF', x: 84, y: 68 },
        { id: 'cdm', label: 'CDM', position: 'CDM', role: 'MID', x: 50, y: 52 },
        { id: 'cm', label: 'CM', position: 'CM', role: 'MID', x: 35, y: 39 },
        { id: 'cam', label: 'CAM', position: 'CAM', role: 'MID', x: 65, y: 39 },
        { id: 'lw', label: 'LW', position: 'LW', role: 'ATT', x: 22, y: 17 },
        { id: 'st', label: 'ST', position: 'ST', role: 'ATT', x: 50, y: 13 },
        { id: 'rw', label: 'RW', position: 'RW', role: 'ATT', x: 78, y: 17 },
    ],
    '4-2-3-1': [
        { id: 'gk', label: 'GK', position: 'GK', role: 'GK', x: 50, y: 88 },
        { id: 'lb', label: 'LB', position: 'LB', role: 'DEF', x: 16, y: 68 },
        { id: 'cb-l', label: 'CB', position: 'CB', role: 'DEF', x: 38, y: 70 },
        { id: 'cb-r', label: 'CB', position: 'CB', role: 'DEF', x: 62, y: 70 },
        { id: 'rb', label: 'RB', position: 'RB', role: 'DEF', x: 84, y: 68 },
        { id: 'cdm-l', label: 'CDM', position: 'CDM', role: 'MID', x: 40, y: 52 },
        { id: 'cdm-r', label: 'CDM', position: 'CDM', role: 'MID', x: 60, y: 52 },
        { id: 'lm', label: 'LM', position: 'LM', role: 'MID', x: 24, y: 34 },
        { id: 'cam', label: 'CAM', position: 'CAM', role: 'MID', x: 50, y: 31 },
        { id: 'rm', label: 'RM', position: 'RM', role: 'MID', x: 76, y: 34 },
        { id: 'st', label: 'ST', position: 'ST', role: 'ATT', x: 50, y: 13 },
    ],
    '3-5-2': [
        { id: 'gk', label: 'GK', position: 'GK', role: 'GK', x: 50, y: 88 },
        { id: 'cb-l', label: 'CB', position: 'CB', role: 'DEF', x: 30, y: 70 },
        { id: 'cb', label: 'CB', position: 'CB', role: 'DEF', x: 50, y: 72 },
        { id: 'cb-r', label: 'CB', position: 'CB', role: 'DEF', x: 70, y: 70 },
        { id: 'lm', label: 'LM', position: 'LM', role: 'MID', x: 15, y: 47 },
        { id: 'cdm', label: 'CDM', position: 'CDM', role: 'MID', x: 38, y: 52 },
        { id: 'cm', label: 'CM', position: 'CM', role: 'MID', x: 50, y: 42 },
        { id: 'cam', label: 'CAM', position: 'CAM', role: 'MID', x: 62, y: 52 },
        { id: 'rm', label: 'RM', position: 'RM', role: 'MID', x: 85, y: 47 },
        { id: 'st-l', label: 'ST', position: 'ST', role: 'ATT', x: 40, y: 16 },
        { id: 'st-r', label: 'ST', position: 'ST', role: 'ATT', x: 60, y: 16 },
    ],
    '5-3-2': [
        { id: 'gk', label: 'GK', position: 'GK', role: 'GK', x: 50, y: 88 },
        { id: 'lwb', label: 'LWB', position: 'LWB', role: 'DEF', x: 12, y: 61 },
        { id: 'cb-l', label: 'CB', position: 'CB', role: 'DEF', x: 32, y: 70 },
        { id: 'cb', label: 'CB', position: 'CB', role: 'DEF', x: 50, y: 72 },
        { id: 'cb-r', label: 'CB', position: 'CB', role: 'DEF', x: 68, y: 70 },
        { id: 'rwb', label: 'RWB', position: 'RWB', role: 'DEF', x: 88, y: 61 },
        { id: 'cdm', label: 'CDM', position: 'CDM', role: 'MID', x: 50, y: 52 },
        { id: 'cm-l', label: 'CM', position: 'CM', role: 'MID', x: 35, y: 38 },
        { id: 'cm-r', label: 'CM', position: 'CM', role: 'MID', x: 65, y: 38 },
        { id: 'st-l', label: 'ST', position: 'ST', role: 'ATT', x: 40, y: 16 },
        { id: 'st-r', label: 'ST', position: 'ST', role: 'ATT', x: 60, y: 16 },
    ],
};

const SAME_LINE_GROUPS: RatingPosition[][] = [
    ['LB', 'CB', 'RB', 'LWB', 'RWB'],
    ['CDM', 'CM', 'CAM', 'LM', 'RM'],
    ['LW', 'RW', 'ST', 'CF'],
];

const emptyAssignments = <TSlot extends { id: string }>(slots: TSlot[]): AssignmentMap => Object.fromEntries(
    slots.map((slot) => [slot.id, null])
) as AssignmentMap;

const getPlayer = (roster: Player[], playerId: string): Player | undefined => {
    return roster.find((player) => player.id === playerId);
};

const isGoalkeeper = (player: Player): boolean => player.mainPosition === 'GK';

const isSameLine = (left: RatingPosition, right: RatingPosition): boolean => {
    return SAME_LINE_GROUPS.some((group) => group.includes(left) && group.includes(right));
};

const BENCH_SLOTS: BenchSlot[] = [
    { id: 'bench-gk', label: 'GK', accepts: 'GK' },
    { id: 'bench-1', label: 'SUB 1', accepts: 'FIELD' },
    { id: 'bench-2', label: 'SUB 2', accepts: 'FIELD' },
    { id: 'bench-3', label: 'SUB 3', accepts: 'FIELD' },
    { id: 'bench-4', label: 'SUB 4', accepts: 'FIELD' },
];

export class LineupService {
    public static getSupportedFormations(): string[] {
        return Object.keys(FORMATIONS);
    }

    public static getFormationSlots(formation: string): FormationSlot[] {
        return [...(FORMATIONS[formation.toUpperCase()] ?? FORMATIONS['4-4-2 DIAMOND']!)];
    }

    public static getBenchSlots(): BenchSlot[] {
        return [...BENCH_SLOTS];
    }

    public static createEmptyLineup(formation: string): AssignmentMap {
        return emptyAssignments(LineupService.getFormationSlots(formation));
    }

    public static createEmptyBench(): AssignmentMap {
        return emptyAssignments(BENCH_SLOTS);
    }

    public static getPositionEfficiency(player: Player, slot: FormationSlot | BenchSlot): number {
        if ('accepts' in slot) {
            if (slot.accepts === 'GK') return isGoalkeeper(player) ? 1.0 : 0.1;
            
            return isGoalkeeper(player) ? 0.1 : 1.0;
        }

        if (slot.position === 'GK') return isGoalkeeper(player) ? 1.0 : 0.1;
        if (isGoalkeeper(player)) return 0.1;

        if (player.mainPosition === slot.position) return 1.0;
        if ((player.secondaryPositions || []).includes(slot.position)) return 0.95;
        if (isSameLine(player.mainPosition, slot.position)) return 0.75;
        
        return 0.25;
    }

    public static getAdjustedRating(player: Player, slot: FormationSlot | BenchSlot): number {
        const efficiency = LineupService.getPositionEfficiency(player, slot);
        
        // If playing in main position, return the true overall rating
        if (efficiency >= 1.0) {
            return player.overallRating;
        }

        // Calculate position-specific rating based on relevant stats
        const positionRating = TeamRatingService.calculatePlayerPositionRating(
            player, 
            'position' in slot ? slot.position : player.mainPosition
        );

        // CAP: The position rating cannot exceed the natural overall rating.
        // Then apply the efficiency penalty (e.g. 0.95 for secondary).
        const baseRating = Math.min(player.overallRating, positionRating);

        return Math.round(baseRating * efficiency);
    }

    public static getPositionEligibility(player: Player, destination: FormationSlot | BenchSlot): Eligibility {
        const efficiency = LineupService.getPositionEfficiency(player, destination);

        if (efficiency >= 1.0) return 'best';
        if (efficiency >= 0.95) return 'secondary';
        if (efficiency >= 0.75) return 'adapted';

        return 'invalid';
    }

    public static createInitialAssignments(roster: Player[], formation: string): {
        lineupSlots: AssignmentMap;
        benchSlots: AssignmentMap;
    } {
        const slots = LineupService.getFormationSlots(formation);
        const lineupSlots = LineupService.createEmptyLineup(formation);
        const benchSlots = LineupService.createEmptyBench();
        const selected = TeamRatingService.selectStartingEleven(roster, formation);
        const usedIds = new Set<string>();

        selected.forEach((selection, index) => {
            const slot = slots[index];
            if (!slot) return;

            lineupSlots[slot.id] = selection.player.id;
            usedIds.add(selection.player.id);
        });

        const benchGoalkeeper = roster
            .filter((player) => !usedIds.has(player.id) && isGoalkeeper(player))
            .sort((left, right) => right.overallRating - left.overallRating)[0];

        if (benchGoalkeeper) {
            benchSlots['bench-gk'] = benchGoalkeeper.id;
            usedIds.add(benchGoalkeeper.id);
        }

        roster
            .filter((player) => !usedIds.has(player.id) && !isGoalkeeper(player))
            .sort((left, right) => right.overallRating - left.overallRating)
            .slice(0, 4)
            .forEach((player, index) => {
                benchSlots[`bench-${index + 1}`] = player.id;
            });

        return { lineupSlots, benchSlots };
    }

    public static remapAssignmentsForFormation(input: RemapFormationInput): {
        lineupSlots: AssignmentMap;
        benchSlots: AssignmentMap;
    } {
        const oldSlots = LineupService.getFormationSlots(input.fromFormation);
        const newSlots = LineupService.getFormationSlots(input.toFormation);
        const lineupSlots = LineupService.createEmptyLineup(input.toFormation);
        const benchSlots = LineupService.normalizeBenchAssignments(input.roster, input.benchSlots);
        const assignedPlayerIds = new Set<string>(Object.values(benchSlots).filter((id): id is string => Boolean(id)));
        const oldStartingEntries = oldSlots
            .map((slot) => {
                const playerId = input.lineupSlots[slot.id];
                const player = playerId ? getPlayer(input.roster, playerId) : undefined;

                return player && !assignedPlayerIds.has(player.id) ? { player, oldSlot: slot } : null;
            })
            .filter((entry): entry is { player: Player; oldSlot: FormationSlot } => Boolean(entry));

        oldStartingEntries.forEach(({ player, oldSlot }) => {
            const slot = LineupService.findBestRemapSlot(player, oldSlot, newSlots, lineupSlots);
            if (!slot) return;

            lineupSlots[slot.id] = player.id;
            assignedPlayerIds.add(player.id);
        });

        return { lineupSlots, benchSlots };
    }

    public static movePlayer(input: MovePlayerInput): MovePlayerResult {
        const player = getPlayer(input.roster, input.playerId);
        if (!player) {
            return { moved: false, lineupSlots: input.lineupSlots, benchSlots: input.benchSlots };
        }

        const source = LineupService.findPlayerLocation(input.lineupSlots, input.benchSlots, input.playerId);
        
        // Handle unassignment (moving back to squad pool)
        if (input.destination.area === 'unassign') {
            if (!source) return { moved: false, lineupSlots: input.lineupSlots, benchSlots: input.benchSlots };
            
            const lineupSlots = { ...input.lineupSlots };
            const benchSlots = { ...input.benchSlots };
            const mutableSource = source.area === 'pitch' ? lineupSlots : benchSlots;
            mutableSource[source.slotId] = null;
            
            return { moved: true, lineupSlots, benchSlots };
        }

        const destinationSlot = LineupService.getDestinationSlot(input.formation, input.destination);
        const efficiency = destinationSlot ? LineupService.getPositionEfficiency(player, destinationSlot) : -1;
        
        // We block moves if the slot is invalid or if it's a hard illegal move (GK to Field or vice versa, efficiency <= 0.1)
        if (!destinationSlot || efficiency <= 0.1) {
            return { moved: false, lineupSlots: input.lineupSlots, benchSlots: input.benchSlots };
        }

        const destinationMap = input.destination.area === 'pitch' ? input.lineupSlots : input.benchSlots;
        const occupyingPlayerId = destinationMap[input.destination.slotId] ?? null;

        if (source?.area === input.destination.area && source.slotId === input.destination.slotId) {
            return { moved: false, lineupSlots: input.lineupSlots, benchSlots: input.benchSlots };
        }

        if (source && occupyingPlayerId) {
            const occupyingPlayer = getPlayer(input.roster, occupyingPlayerId);
            const sourceSlot = LineupService.getDestinationSlot(input.formation, source);

            if (!occupyingPlayer || !sourceSlot) {
                return { moved: false, lineupSlots: input.lineupSlots, benchSlots: input.benchSlots };
            }

            // Block swap if the occupying player cannot play in the source slot at all (hard block)
            if (LineupService.getPositionEfficiency(occupyingPlayer, sourceSlot) < 0.1) {
                return { moved: false, lineupSlots: input.lineupSlots, benchSlots: input.benchSlots };
            }
        }

        const lineupSlots = { ...input.lineupSlots };
        const benchSlots = { ...input.benchSlots };
        const mutableDestination = input.destination.area === 'pitch' ? lineupSlots : benchSlots;

        if (source) {
            const mutableSource = source.area === 'pitch' ? lineupSlots : benchSlots;
            mutableSource[source.slotId] = occupyingPlayerId;
        }

        mutableDestination[input.destination.slotId] = input.playerId;

        return { moved: true, lineupSlots, benchSlots };
    }

    public static calculateAssignedTeamRating(roster: Player[], formation: string, lineupSlots: AssignmentMap) {
        const assignedLineup = LineupService.getAssignedStarters(roster, formation, lineupSlots);

        if (assignedLineup.length === 0) {
            return TeamRatingService.calculateTeamRating(roster, formation);
        }

        return TeamRatingService.calculateTeamRatingForLineup(assignedLineup);
    }

    public static getAssignedStarters(roster: Player[], formation: string, lineupSlots: AssignmentMap): RatedLineupPlayer[] {
        return LineupService.getFormationSlots(formation).flatMap((slot) => {
            const playerId = lineupSlots[slot.id];
            if (!playerId) return [];

            const player = getPlayer(roster, playerId);
            if (!player) return [];

            return [{
                player,
                assignedPosition: slot.position,
                rating: TeamRatingService.calculatePlayerPositionRating(player, slot.position),
            }];
        });
    }

    private static findPlayerLocation(lineupSlots: AssignmentMap, benchSlots: AssignmentMap, playerId: string): AssignmentDestination | null {
        const pitchEntry = Object.entries(lineupSlots).find(([, assignedPlayerId]) => assignedPlayerId === playerId);
        if (pitchEntry) return { area: 'pitch', slotId: pitchEntry[0] };

        const benchEntry = Object.entries(benchSlots).find(([, assignedPlayerId]) => assignedPlayerId === playerId);
        if (benchEntry) return { area: 'bench', slotId: benchEntry[0] };

        return null;
    }

    private static getDestinationSlot(formation: string, destination: AssignmentDestination): FormationSlot | BenchSlot | null {
        if (destination.area === 'bench') {
            return BENCH_SLOTS.find((slot) => slot.id === destination.slotId) ?? null;
        }

        return LineupService.getFormationSlots(formation).find((slot) => slot.id === destination.slotId) ?? null;
    }

    private static normalizeBenchAssignments(roster: Player[], benchSlots: AssignmentMap): AssignmentMap {
        const normalized = LineupService.createEmptyBench();
        const usedIds = new Set<string>();

        BENCH_SLOTS.forEach((slot) => {
            const playerId = benchSlots[slot.id];
            const player = playerId ? getPlayer(roster, playerId) : undefined;
            if (!player || usedIds.has(player.id)) return;
            if (LineupService.getPositionEligibility(player, slot) === 'invalid') return;

            normalized[slot.id] = player.id;
            usedIds.add(player.id);
        });

        return normalized;
    }

    private static findBestRemapSlot(
        player: Player,
        oldSlot: FormationSlot,
        newSlots: FormationSlot[],
        lineupSlots: AssignmentMap
    ): FormationSlot | null {
        const availableSlots = newSlots.filter((slot) => !lineupSlots[slot.id]);
        if (availableSlots.length === 0) return null;

        if (isGoalkeeper(player)) {
            return availableSlots.find((slot) => slot.position === 'GK') ?? null;
        }

        const stableSlot = availableSlots.find((slot) => slot.id === oldSlot.id && slot.position !== 'GK');
        if (stableSlot) return stableSlot;

        const nativeSlot = availableSlots.find((slot) => slot.position === player.mainPosition && slot.position !== 'GK');
        if (nativeSlot) return nativeSlot;

        const secondarySlot = availableSlots.find((slot) => player.secondaryPositions.includes(slot.position));
        if (secondarySlot) return secondarySlot;

        const sameLineSlot = availableSlots.find((slot) => slot.position !== 'GK' && isSameLine(oldSlot.position, slot.position));
        if (sameLineSlot) return sameLineSlot;

        return availableSlots.find((slot) => slot.position !== 'GK') ?? null;
    }
}
