import { Player } from '../schemas/EntitySchemas';
import { createPRNG } from '@utils/Random';
import { PLAYER_CATALOG } from '../registry/PlayerCatalog';

/**
 * Factory service to pick players from catalog and initialize squads.
 */
export class PlayerFactory {
    private static instance: PlayerFactory;

    private constructor() {}

    public static getInstance(): PlayerFactory {
        if (!PlayerFactory.instance) {
            PlayerFactory.instance = new PlayerFactory();
        }
        return PlayerFactory.instance;
    }

    /**
     * Picks a random player from the catalog filtered by position and division.
     */
    public pickFromCatalog(position: string, division: number, excludedIds: string[] = [], seed?: number): Player {
        const prng = createPRNG(seed ?? Math.floor(Math.random() * 1000000));
        
        const candidates = PLAYER_CATALOG.filter(p => 
            p.mainPosition === position && 
            p.division <= division && 
            !excludedIds.includes(p.catalogId)
        );

        if (candidates.length === 0) {
            throw new Error(`No candidates found in catalog for position ${position} and division ${division}`);
        }

        const picked = candidates[Math.floor(prng() * candidates.length)]!;

        return {
            ...picked,
            id: crypto.randomUUID(), // Unique instance ID
            level: 1,
            xp: 0,
            morale: 50,
            condition: 100,
            stamina: 100
        } as Player;
    }

    /**
     * Generates a balanced initial squad of 24 players based on the 3/7/7/7 rule.
     */
    public generateInitialSquad(division: number = 4, seed?: number): Player[] {
        const squad: Player[] = [];
        const baseSeed = seed ?? Math.floor(Math.random() * 1000000);
        const usedCatalogIds: string[] = [];

        const addPlayers = (count: number, positions: string[], offset: number) => {
            for (let i = 0; i < count; i++) {
                const pos = positions[i % positions.length]!;
                const player = this.pickFromCatalog(pos, division, usedCatalogIds, baseSeed + offset + i);
                squad.push(player);
                usedCatalogIds.push(player.catalogId as string); // Avoid duplicates from same catalog entry
            }
        };

        // 3 Gardiens (GK)
        addPlayers(3, ['GK'], 100);

        // 7 Défenseurs (DEF)
        addPlayers(7, ['CB', 'LB', 'RB', 'CB', 'LB', 'RB', 'CB'], 200);

        // 7 Milieux (MID)
        addPlayers(7, ['CDM', 'CM', 'CAM', 'CM', 'CDM', 'CM', 'CAM'], 300);

        // 7 Attaquants (ATT)
        addPlayers(7, ['ST', 'LW', 'RW', 'ST', 'LW', 'RW', 'ST'], 400);

        return squad;
    }
}
