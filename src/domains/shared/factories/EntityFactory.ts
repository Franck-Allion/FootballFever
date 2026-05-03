import { PlayerSchema, type Player } from '../schemas/EntitySchemas';

type DeepPartial<T> = {
    [Key in keyof T]?: T[Key] extends Array<infer ArrayItem>
        ? Array<ArrayItem>
        : T[Key] extends Record<string, unknown>
            ? DeepPartial<T[Key]>
            : T[Key];
};

const basePlayer: Player = {
    id: 'player-0',
    name: 'Academy Striker',
    rarity: 'Common',
    position: 'ST',
    stats: {
        pace: 70,
        shooting: 68,
        passing: 61,
        dribbling: 66,
        defense: 40,
        physical: 64
    },
    level: 1,
    xp: 0,
    age: 18
};

export class EntityFactory {
    private static playerCounter = 0;

    public static createPlayer(overrides: DeepPartial<Player> = {}): Player {
        const playerId = overrides.id ?? `player-${EntityFactory.playerCounter}`;
        const mergedPlayer: Player = {
            ...basePlayer,
            ...overrides,
            id: playerId,
            stats: {
                ...basePlayer.stats,
                ...overrides.stats
            }
        };

        EntityFactory.playerCounter += 1;

        return PlayerSchema.parse(mergedPlayer);
    }

    public static resetCounters(): void {
        EntityFactory.playerCounter = 0;
    }
}
