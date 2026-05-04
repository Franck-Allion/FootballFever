import {
    type FieldPlayerStats,
    type GoalkeeperStats,
    type Player,
} from '../schemas/EntitySchemas';

export type RatingPosition = Player['mainPosition'];

export interface RatedLineupPlayer {
    player: Player;
    assignedPosition: RatingPosition;
    rating: number;
}

export interface TeamRatingResult {
    overallRating: number;
    composites: {
        attack: number;
        midfield: number;
        defense: number;
        shooting: number;
        passing: number;
        physical: number;
    };
    staminaAvg: number;
    morale: number;
    startingEleven: RatedLineupPlayer[];
}

type FieldScoreName = 'passing' | 'progression' | 'duel' | 'defensive' | 'shooting' | 'aerial';
type GoalkeeperScoreName = 'shotStopping' | 'aerialControl' | 'penaltySaving';

const FORMATION_SLOTS: Record<string, RatingPosition[]> = {
    '4-4-2 DIAMOND': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CM', 'CM', 'CAM', 'ST', 'ST'],
    '4-3-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'ST', 'RW'],
    '4-2-3-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'LM', 'CAM', 'RM', 'ST'],
};

const DEFENSIVE_POSITIONS = new Set<RatingPosition>(['LB', 'CB', 'RB', 'LWB', 'RWB']);
const MIDFIELD_POSITIONS = new Set<RatingPosition>(['CDM', 'CM', 'CAM', 'LM', 'RM']);
const ATTACK_POSITIONS = new Set<RatingPosition>(['LW', 'RW', 'ST', 'CF']);

const clampRating = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

const average = (values: number[]): number => {
    if (values.length === 0) return 0;

    return clampRating(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const isGoalkeeper = (player: Player): player is Player & { stats: GoalkeeperStats } => {
    return player.mainPosition === 'GK';
};

const asFieldStats = (player: Player): FieldPlayerStats => player.stats as FieldPlayerStats;

const getCondition = (player: Player): number => player.condition ?? 100;

const getStamina = (player: Player): number => player.stamina ?? 100;

const getMorale = (player: Player): number => player.morale ?? 50;

const calculateFieldScores = (player: Player): Record<FieldScoreName, number> => {
    const stats = asFieldStats(player);
    const morale = getMorale(player);
    const stamina = getStamina(player);
    const physical = getCondition(player);

    return {
        passing: stats.passing * 0.5 + stats.vision * 0.25 + morale * 0.15 + stamina * 0.1,
        progression: stats.vision * 0.35 + stats.passing * 0.3 + stats.pace * 0.2 + morale * 0.15,
        duel: stats.duels * 0.4 + physical * 0.3 + stats.pace * 0.15 + morale * 0.15,
        defensive: stats.tackling * 0.4 + stats.duels * 0.25 + physical * 0.2 + stamina * 0.15,
        shooting: stats.shooting * 0.55 + morale * 0.2 + stats.pace * 0.1 + physical * 0.05 + stats.heading * 0.1,
        aerial: stats.heading * 0.45 + physical * 0.3 + stats.duels * 0.2 + morale * 0.05,
    };
};

const calculateGoalkeeperScores = (player: Player & { stats: GoalkeeperStats }): Record<GoalkeeperScoreName, number> => {
    const stats = player.stats;
    const morale = getMorale(player);

    return {
        shotStopping: stats.lineSaving * 0.35 + stats.reflexes * 0.3 + stats.diving * 0.25 + morale * 0.1,
        aerialControl: stats.aerialClaim * 0.35 + stats.cornerClaim * 0.35 + stats.reflexes * 0.15 + morale * 0.15,
        penaltySaving: stats.reflexes * 0.4 + stats.diving * 0.3 + stats.lineSaving * 0.2 + morale * 0.1,
    };
};

const canPlayPosition = (player: Player, position: RatingPosition): boolean => {
    return player.mainPosition === position || player.secondaryPositions.includes(position);
};

const getFallbackSlots = (formation: string): RatingPosition[] => {
    return FORMATION_SLOTS[formation.toUpperCase()] ?? FORMATION_SLOTS['4-4-2 DIAMOND'];
};

export class TeamRatingService {
    public static getFormationSlots(formation: string): RatingPosition[] {
        return [...getFallbackSlots(formation)];
    }

    public static calculatePlayerPositionRating(player: Player, position: RatingPosition = player.mainPosition): number {
        // CRITICAL: Penalize players in wrong positions
        const isActuallyGK = isGoalkeeper(player);
        const targetIsGK = position === 'GK';

        if (isActuallyGK !== targetIsGK) {
            // Massive penalty (90%) for GK in field or field player in goal
            return clampRating(player.overallRating * 0.1);
        }

        if (isActuallyGK) {
            const stats = player.stats as GoalkeeperStats;
            const scores = calculateGoalkeeperScores(player as Player & { stats: GoalkeeperStats });
            return clampRating(
                scores.shotStopping * 0.55
                + scores.aerialControl * 0.2
                + scores.penaltySaving * 0.1
                + stats.positioning * 0.1
                + stats.communication * 0.05
            );
        }

        const stats = asFieldStats(player);
        const scores = calculateFieldScores(player);

        // Position specific penalty for non-specialists (20%) if not a secondary position
        const positionPenalty = canPlayPosition(player, position) ? 1.0 : 0.8;
        let baseRating = 0;

        switch (position) {
            case 'CB':
                baseRating = scores.defensive * 0.5 + scores.duel * 0.2 + scores.aerial * 0.2 + scores.passing * 0.1;
                break;
            case 'LB':
            case 'RB':
            case 'LWB':
            case 'RWB':
                baseRating = scores.defensive * 0.4 + scores.progression * 0.25 + scores.passing * 0.2 + getStamina(player) * 0.15;
                break;
            case 'CDM':
                baseRating = scores.defensive * 0.35 + scores.passing * 0.35 + scores.duel * 0.15 + scores.progression * 0.15;
                break;
            case 'CM':
                baseRating = scores.passing * 0.4 + scores.progression * 0.25 + scores.duel * 0.2 + scores.defensive * 0.15;
                break;
            case 'CAM':
            case 'LM':
            case 'RM':
                baseRating = scores.passing * 0.3 + scores.progression * 0.3 + scores.shooting * 0.25 + scores.duel * 0.15;
                break;
            case 'LW':
            case 'RW':
                baseRating = scores.shooting * 0.35 + scores.progression * 0.3 + scores.passing * 0.15 + scores.duel * 0.1 + getStamina(player) * 0.1;
                break;
            case 'ST':
            case 'CF':
                baseRating = scores.shooting * 0.55 + scores.aerial * 0.15 + scores.progression * 0.15 + stats.composure * 0.15;
                break;
            default:
                baseRating = player.overallRating;
        }

        return clampRating(baseRating * positionPenalty);
    }

    public static selectStartingEleven(roster: Player[], formation: string): RatedLineupPlayer[] {
        const available = [...roster];

        return getFallbackSlots(formation).reduce<RatedLineupPlayer[]>((lineup, slot) => {
            if (available.length === 0) return lineup;

            const compatiblePlayers = available.filter((player) => canPlayPosition(player, slot));
            const candidates = compatiblePlayers.length > 0 ? compatiblePlayers : available;
            const bestPlayer = candidates
                .map((player) => ({
                    player,
                    rating: TeamRatingService.calculatePlayerPositionRating(player, slot),
                }))
                .sort((left, right) => right.rating - left.rating)[0];

            if (!bestPlayer) return lineup;

            const selectedIndex = available.findIndex((player) => player.id === bestPlayer.player.id);
            available.splice(selectedIndex, 1);
            lineup.push({
                player: bestPlayer.player,
                assignedPosition: slot,
                rating: bestPlayer.rating,
            });

            return lineup;
        }, []);
    }

    public static calculateTeamAverages(lineup: RatedLineupPlayer[]): Pick<TeamRatingResult, 'staminaAvg' | 'morale'> {
        const players = lineup.map(({ player }) => player);

        return {
            staminaAvg: average(players.map(getStamina)),
            morale: average(players.map(getMorale)),
        };
    }

    public static calculateTeamRating(roster: Player[], formation = '4-4-2 DIAMOND'): TeamRatingResult {
        const startingEleven = TeamRatingService.selectStartingEleven(roster, formation);
        const averages = TeamRatingService.calculateTeamAverages(startingEleven);
        const byGroup = (predicate: (position: RatingPosition) => boolean): number[] => startingEleven
            .filter(({ assignedPosition }) => predicate(assignedPosition))
            .map(({ rating }) => rating);

        const attack = average(byGroup((position) => ATTACK_POSITIONS.has(position)));
        const midfield = average(byGroup((position) => MIDFIELD_POSITIONS.has(position)));
        const defense = average(byGroup((position) => position === 'GK' || DEFENSIVE_POSITIONS.has(position)));

        return {
            overallRating: average(startingEleven.map(({ rating }) => rating)),
            composites: {
                attack,
                midfield,
                defense,
                shooting: attack,
                passing: midfield,
                physical: average([averages.staminaAvg, defense]),
            },
            ...averages,
            startingEleven,
        };
    }
}
