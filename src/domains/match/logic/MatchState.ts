import { z } from 'zod';
import { MatchZoneIdSchema } from './MatchZone';

/**
 * Stats for a single team during a match.
 */
export const MatchStatsSchema = z.object({
  shots: z.number().int().finite().min(0).default(0),
  shotsOnTarget: z.number().int().finite().min(0).default(0),
  goals: z.number().int().finite().min(0).default(0),
  xG: z.number().finite().min(0).default(0),
  possessionSeconds: z.number().int().finite().min(0).default(0),
});

export type MatchStats = z.infer<typeof MatchStatsSchema>;

/**
 * Zod schema for the Match State.
 * This is the single source of truth for a match simulation step.
 */
export const TeamRatingSchema = z.object({
  shooting: z.number().finite().min(0).max(100),
});

export type TeamRating = z.infer<typeof TeamRatingSchema>;

export const MatchStateSchema = z.object({
  matchId: z.string().min(1),
  seed: z.number().int().finite(),
  minute: z.number().int().finite().min(0).max(120),
  second: z.number().int().finite().min(0).max(59),
  period: z.number().int().finite().min(1).max(4), // 1, 2 (normal), 3, 4 (extra time)
  score: z.object({
    home: z.number().int().finite().min(0),
    away: z.number().int().finite().min(0),
  }),
  homeStats: MatchStatsSchema,
  awayStats: MatchStatsSchema,
  homeRating: TeamRatingSchema,
  awayRating: TeamRatingSchema,
  possessionTeam: z.enum(['home', 'away']),
  ballZone: MatchZoneIdSchema,
  currentPhase: z.enum(['OPEN_PLAY', 'SET_PIECE', 'GOAL_KICK', 'CORNER', 'PENALTY', 'KICK_OFF']),
  isComplete: z.boolean().default(false),
}).superRefine((state, context) => {
  if (state.score.home !== state.homeStats.goals) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Home score must match home goals.',
      path: ['score', 'home'],
    });
  }

  if (state.score.away !== state.awayStats.goals) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Away score must match away goals.',
      path: ['score', 'away'],
    });
  }
});

export type MatchState = z.infer<typeof MatchStateSchema>;

/**
 * Initial state factory for a new match.
 */
export function createInitialMatchState(params: {
  matchId: string;
  seed: number;
  homeRating?: TeamRating;
  awayRating?: TeamRating;
}): MatchState {
  return {
    matchId: params.matchId,
    seed: params.seed,
    minute: 0,
    second: 0,
    period: 1,
    score: { home: 0, away: 0 },
    homeStats: { shots: 0, shotsOnTarget: 0, goals: 0, xG: 0, possessionSeconds: 0 },
    awayStats: { shots: 0, shotsOnTarget: 0, goals: 0, xG: 0, possessionSeconds: 0 },
    homeRating: params.homeRating ?? { shooting: 50 },
    awayRating: params.awayRating ?? { shooting: 50 },
    possessionTeam: 'home',
    ballZone: 'MID_CENTER_L', // Default kickoff zone
    currentPhase: 'KICK_OFF',
    isComplete: false,
  };
}
