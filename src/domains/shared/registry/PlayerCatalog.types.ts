import type { Player } from '../schemas/EntitySchemas';

export interface CatalogPlayer extends Omit<Player, 'id' | 'xp' | 'level' | 'morale' | 'condition' | 'stamina'> {
    catalogId: string;
    division: number;
}
