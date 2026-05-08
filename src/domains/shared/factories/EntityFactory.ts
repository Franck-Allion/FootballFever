import { PlayerSchema, type Player } from '../schemas/EntitySchemas';

type DeepPartial<T> = {
    [Key in keyof T]?: T[Key] extends Array<infer ArrayItem>
        ? Array<ArrayItem>
        : T[Key] extends Record<string, unknown>
            ? DeepPartial<T[Key]>
            : T[Key];
};

const basePlayer = {
    id: 'player-0',
    name: 'Academy Striker',
    rarity: 'Common',
    mainPosition: 'ST',
    secondaryPositions: [],
    stats: {
        tackling: 30,
        marking: 30,
        positioning: 70,
        passing: 60,
        vision: 50,
        clearance: 30,
        technique: 65,
        dribbling: 65,
        pace: 75,
        acceleration: 75,
        stamina: 70,
        power: 65,
        duels: 50,
        heading: 60,
        shooting: 70,
        finishing: 75,
        composure: 65
    },
    overallRating: 65,
    morale: 50,
    condition: 100,
    level: 1,
    xp: 0,
    xpGainMultiplier: 1.0,
    potential: 80,
    age: 18,
    preferredSystem: '4-4-2',
    prestigeValue: 1000,
    portraitUrl: '/assets/portraits/default.png'
};

export class EntityFactory {
    private static playerCounter = 0;

    public static createPlayer(overrides: DeepPartial<Player> = {}): Player {
        const playerId = overrides.id ?? `player-${EntityFactory.playerCounter}`;
        const mainPosition = overrides.mainPosition ?? basePlayer.mainPosition;

        // Use appropriate base stats based on position to avoid pollution
        const isGK = mainPosition === 'GK';
        const templateStats = isGK ? baseGKStats : basePlayer.stats;

        // Deep merge stats specifically to avoid losing base stats
        const mergedStats = {
            ...templateStats,
            ...(overrides.stats || {})
        };

        const mergedPlayer = {
            ...basePlayer,
            ...overrides,
            id: playerId,
            stats: mergedStats
        };

        EntityFactory.playerCounter += 1;
        return PlayerSchema.parse(mergedPlayer);
    }

    public static resetCounters(): void {
        EntityFactory.playerCounter = 0;
    }
}
