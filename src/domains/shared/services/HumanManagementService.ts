import { type Player } from '../schemas/EntitySchemas';

export type MatchOutcome = 'win' | 'loss' | 'draw';

export interface PlayerMatchContext {
    outcome: MatchOutcome;
    playedInMatch: boolean;
    finalStamina?: number; // 0-100, captured from match simulation for starters
    seed: number; // Seed for deterministic variety
}

export class HumanManagementService {
    /**
     * Applies morale and condition changes based on match outcome.
     * Pure function.
     */
    public static evolvePlayerAfterMatch(player: Player, context: PlayerMatchContext): Player {
        const nextPlayer = { ...player };
        
        // Simple local deterministic RNG for variety
        const rng = (seed: number) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };

        // 1. Morale Evolution (Plage +5 à +10 ou -5 à -10)
        const roll = rng(context.seed + parseInt(player.id.replace(/\D/g, '') || '0'));
        const variance = Math.floor(roll * 6); // 0-5
        
        let moraleChange = 0;
        switch (context.outcome) {
            case 'win':
                moraleChange = 5 + variance; // 5 to 10
                break;
            case 'loss':
                moraleChange = -(5 + variance); // -5 to -10
                break;
            case 'draw':
                moraleChange = 1 + Math.floor(roll * 3); // 1 to 3
                break;
        }
        
        nextPlayer.morale = Math.min(100, Math.max(0, player.morale + moraleChange));

        // 2. Stamina & Condition Impact
        if (context.playedInMatch && context.finalStamina !== undefined) {
            // Sync current stamina from match state
            nextPlayer.stamina = Math.min(100, Math.max(0, context.finalStamina));
            
            // Condition (Physique) is impacted by match intensity
            // Every 1% stamina lost in match = 0.5% condition loss for next match
            const staminaLoss = Math.max(0, 100 - nextPlayer.stamina);
            nextPlayer.condition = Math.max(0, Math.round(player.condition - (staminaLoss * 0.5)));
        }

        return nextPlayer;
    }

    /**
     * Recovers stamina and condition for players who rested or between match days.
     * Pure function.
     */
    public static applyRestRecovery(player: Player): Player {
        const nextPlayer = { ...player };
        
        // Stamina always resets to 100% between matches (readiness for kickoff)
        nextPlayer.stamina = 100;
        
        // Condition recovers by +15% per rest period (match day)
        nextPlayer.condition = Math.min(100, player.condition + 15);
        
        return nextPlayer;
    }
}
