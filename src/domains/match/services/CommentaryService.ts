import { MatchState } from '../logic/MatchState';
import { MatchLogEntry } from '../store/useMatchLogStore';

/**
 * Service to generate localized commentary keys from MatchState changes.
 */
export class CommentaryService {
    private static instance: CommentaryService;
    private lastMinute = -1;

    private constructor() {}

    public static getInstance(): CommentaryService {
        if (!CommentaryService.instance) {
            CommentaryService.instance = new CommentaryService();
        }
        return CommentaryService.instance;
    }

    public generateLog(state: MatchState, previousState?: MatchState): MatchLogEntry[] {
        const logs: MatchLogEntry[] = [];
        const { minute, second, score, homeStats, awayStats } = state;

        // 1. Check for kickoff
        if (!previousState || (previousState.currentPhase === 'KICK_OFF' && state.currentPhase === 'OPEN_PLAY')) {
            logs.push({
                id: crypto.randomUUID(),
                minute,
                second,
                text: "match.kickoff",
                type: 'WHISTLE',
                intensity: 'MEDIUM'
            });
        }

        // 2. Check for Half Time
        if (previousState && previousState.minute < 45 && state.minute >= 45 && !state.isComplete) {
            logs.push({
                id: crypto.randomUUID(),
                minute: 45,
                second: 0,
                text: "match.half_time",
                type: 'WHISTLE',
                intensity: 'MEDIUM'
            });
        }

        // 3. Check for goals
        if (previousState) {
            if (state.score.home > previousState.score.home) {
                logs.push({
                    id: crypto.randomUUID(),
                    minute,
                    second,
                    text: "match.goal_home",
                    params: [state.score.home, state.score.away],
                    type: 'GOAL',
                    intensity: 'HIGH'
                });
            }
            if (state.score.away > previousState.score.away) {
                logs.push({
                    id: crypto.randomUUID(),
                    minute,
                    second,
                    text: "match.goal_away",
                    params: [state.score.home, state.score.away],
                    type: 'GOAL',
                    intensity: 'HIGH'
                });
            }
        }

        // 4. Check for shots (non-goal)
        if (previousState) {
            const homeShotsDelta = homeStats.shots - previousState.homeStats.shots;
            const awayShotsDelta = awayStats.shots - previousState.awayStats.shots;
            
            if (homeShotsDelta > 0 && state.score.home === previousState.score.home) {
                logs.push({
                    id: crypto.randomUUID(),
                    minute,
                    second,
                    text: "match.shot_miss_home",
                    type: 'EVENT',
                    intensity: 'MEDIUM'
                });
            }
            if (awayShotsDelta > 0 && state.score.away === previousState.score.away) {
                logs.push({
                    id: crypto.randomUUID(),
                    minute,
                    second,
                    text: "match.shot_miss_away",
                    type: 'EVENT',
                    intensity: 'MEDIUM'
                });
            }
        }

        // 5. Periodic momentum comments
        if (logs.length === 0 && minute !== this.lastMinute && minute > 0 && minute % 10 === 0) {
            logs.push({
                id: crypto.randomUUID(),
                minute,
                second,
                text: "match.momentum_neutral",
                type: 'EVENT',
                intensity: 'LOW'
            });
            this.lastMinute = minute;
        }

        // 6. Check for end match
        if (state.isComplete && (!previousState || !previousState.isComplete)) {
            logs.push({
                id: crypto.randomUUID(),
                minute,
                second,
                text: "match.full_time",
                params: [score.home, score.away],
                type: 'WHISTLE',
                intensity: 'HIGH'
            });
        }

        return logs;
    }

    public reset(): void {
        this.lastMinute = -1;
    }
}
