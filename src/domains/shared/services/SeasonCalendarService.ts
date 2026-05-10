import { createPRNG } from '../../../utils/Random';
import { type TimelineNode } from '../schemas/EntitySchemas';

export class SeasonCalendarService {
    /**
     * Generates an initial ribbon of match and rest nodes for a new career.
     * Guaranteed to be deterministic if a seed is provided.
     */
    public static generateInitialCalendar(seed: number = Date.now()): TimelineNode[] {
        const rng = createPRNG(seed);
        const nodes: TimelineNode[] = [];
        
        // Always start with a match as current
        nodes.push({
            id: 'node-1',
            type: 'match',
            label: 'hub.match_day',
            status: 'current',
            opponent: 'Opponent 1', // Placeholder opponent name
            difficulty: 'NORMAL'
        });

        // Generate 4-7 more nodes with a mix of match and rest
        const totalNodes = 5 + Math.floor(rng() * 3);
        
        for (let i = 2; i <= totalNodes; i++) {
            const isMatch = rng() > 0.3; // 70% chance of match
            const type = isMatch ? 'match' : 'rest';
            
            nodes.push({
                id: `node-${i}`,
                type,
                label: type === 'match' ? 'hub.match_day' : 'hub.rest_day',
                status: 'locked',
                opponent: type === 'match' ? `Opponent ${i}` : undefined,
                difficulty: type === 'match' ? 'NORMAL' : undefined
            });
        }

        return nodes;
    }
}
