import { z } from 'zod';
import { MatchState, createInitialMatchState, MatchStateSchema, TeamRatingSchema } from './MatchState';
import { advanceMatchState } from './MatchSimulation';

/**
 * Configuration for a batch simulation run.
 */
export const BatchSimulationConfigSchema = z.object({
  matchCount: z.number().int().min(1).max(10000), // Safety limit to prevent OOM
  baseSeed: z.number().int(),
  maxTicksPerMatch: z.number().int().min(1).default(2000), // Enough for 90m + stoppage
  homeRating: TeamRatingSchema.optional(),
  awayRating: TeamRatingSchema.optional(),
});

export type BatchSimulationConfig = z.infer<typeof BatchSimulationConfigSchema>;

/**
 * Summary of a single match in a batch.
 */
export interface BatchMatchSummary {
  matchIndex: number;
  matchId: string;
  seed: number;
  finalState: MatchState;
  ticksSimulated: number;
  invariantFailures: MatchInvariantFailure[];
}

/**
 * Structured invariant failure details.
 */
export interface MatchInvariantFailure {
  matchIndex: number;
  matchId: string;
  code: string;
  message: string;
}

/**
 * Aggregated metrics for the whole batch.
 */
export interface BatchSimulationAggregates {
  totalMatches: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  totalGoals: number;
  homeGoals: number;
  awayGoals: number;
  totalShots: number;
  totalShotsOnTarget: number;
  totalXG: number;
  totalPossessionSeconds: number;
  averageGoalsPerMatch: number;
  averageShotsPerTeam: number;
  averageShotsOnTargetPerTeam: number;
  averageXGPerTeam: number;
  homeWinRate: number;
  drawRate: number;
  awayWinRate: number;
}

/**
 * Result of a batch simulation run.
 */
export interface BatchSimulationResult {
  config: BatchSimulationConfig;
  matches: BatchMatchSummary[];
  aggregates: BatchSimulationAggregates;
  invariantFailures: MatchInvariantFailure[];
}

/**
 * Check invariants for a completed match state.
 */
export function checkInvariants(state: MatchState, matchIndex: number): MatchInvariantFailure[] {
  const failures: MatchInvariantFailure[] = [];
  const addFailure = (code: string, message: string) => {
    failures.push({ matchIndex, matchId: state.matchId, code, message });
  };

  // 1. Zod Validation
  const parseResult = MatchStateSchema.safeParse(state);
  if (!parseResult.success) {
    addFailure('INVALID_SCHEMA', 'Final state does not match MatchStateSchema');
  }

  // 2. Score/Stat Consistency
  if (state.score.home !== state.homeStats.goals) {
    addFailure('SCORE_MISMATCH_HOME', `Score (${state.score.home}) != Goals (${state.homeStats.goals})`);
  }
  if (state.score.away !== state.awayStats.goals) {
    addFailure('SCORE_MISMATCH_AWAY', `Score (${state.score.away}) != Goals (${state.awayStats.goals})`);
  }

  // 3. Shooting Invariants
  if (state.homeStats.shotsOnTarget > state.homeStats.shots) {
    addFailure('SHOTS_ON_TARGET_EXCEED_TOTAL_HOME', 'Shots on target > total shots');
  }
  if (state.awayStats.shotsOnTarget > state.awayStats.shots) {
    addFailure('SHOTS_ON_TARGET_EXCEED_TOTAL_AWAY', 'Shots on target > total shots');
  }
  if (state.homeStats.goals > state.homeStats.shotsOnTarget) {
    addFailure('GOALS_EXCEED_SHOTS_ON_TARGET_HOME', 'Goals > shots on target');
  }
  if (state.awayStats.goals > state.awayStats.shotsOnTarget) {
    addFailure('GOALS_EXCEED_SHOTS_ON_TARGET_AWAY', 'Goals > shots on target');
  }

  // 4. xG Invariants
  if (!Number.isFinite(state.homeStats.xG) || state.homeStats.xG < 0) {
    addFailure('INVALID_XG_HOME', 'xG must be finite and non-negative');
  }
  if (!Number.isFinite(state.awayStats.xG) || state.awayStats.xG < 0) {
    addFailure('INVALID_XG_AWAY', 'xG must be finite and non-negative');
  }

  // 5. Possession Invariants
  const totalPossession = state.homeStats.possessionSeconds + state.awayStats.possessionSeconds;
  const matchDurationSeconds = (state.minute * 60) + state.second;
  // AC requirement: does not exceed duration by more than one tick (5s)
  if (totalPossession > matchDurationSeconds + 5) { 
    addFailure('POSSESSION_OVERFLOW', `Total possession (${totalPossession}s) exceeds match duration (${matchDurationSeconds}s)`);
  }
  // Underflow check: possession should not be significantly less than duration either
  if (totalPossession < matchDurationSeconds - 5) {
    addFailure('POSSESSION_UNDERFLOW', `Total possession (${totalPossession}s) is significantly less than match duration (${matchDurationSeconds}s)`);
  }

  return failures;
}

/**
 * Runs a batch simulation based on provided config.
 */
export function runBatchSimulation(configInput: Partial<BatchSimulationConfig> & { baseSeed: number; matchCount: number }): BatchSimulationResult {
  const config = BatchSimulationConfigSchema.parse(configInput);
  const matches: BatchMatchSummary[] = [];
  const allInvariantFailures: MatchInvariantFailure[] = [];

  for (let i = 0; i < config.matchCount; i++) {
    // Prevent overflow by wrapping seed
    const seed = (config.baseSeed + i) % Number.MAX_SAFE_INTEGER;
    const matchId = `BATCH_${config.baseSeed}_${i}`;
    
    let state = createInitialMatchState({ 
      matchId, 
      seed,
      homeRating: config.homeRating,
      awayRating: config.awayRating
    });
    let ticks = 0;

    try {
      while (!state.isComplete && ticks < config.maxTicksPerMatch) {
        state = advanceMatchState(state);
        ticks++;
      }
    } catch (error) {
      allInvariantFailures.push({
        matchIndex: i,
        matchId,
        code: 'CRITICAL_ENGINE_ERROR',
        message: error instanceof Error ? error.message : String(error)
      });
      // Continue to next match instead of crashing whole batch
      continue;
    }

    const invariantFailures = checkInvariants(state, i);
    if (ticks >= config.maxTicksPerMatch && !state.isComplete) {
      invariantFailures.push({
        matchIndex: i,
        matchId,
        code: 'LOOP_SAFETY_TRIGGERED',
        message: `Match exceeded max ticks (${config.maxTicksPerMatch}) without completing`
      });
    }

    matches.push({
      matchIndex: i,
      matchId,
      seed,
      finalState: state,
      ticksSimulated: ticks,
      invariantFailures
    });

    allInvariantFailures.push(...invariantFailures);
  }

  // Calculate Aggregates
  const agg: BatchSimulationAggregates = {
    totalMatches: config.matchCount,
    homeWins: 0,
    awayWins: 0,
    draws: 0,
    totalGoals: 0,
    homeGoals: 0,
    awayGoals: 0,
    totalShots: 0,
    totalShotsOnTarget: 0,
    totalXG: 0,
    totalPossessionSeconds: 0,
    averageGoalsPerMatch: 0,
    averageShotsPerTeam: 0,
    averageShotsOnTargetPerTeam: 0,
    averageXGPerTeam: 0,
    homeWinRate: 0,
    drawRate: 0,
    awayWinRate: 0,
  };

  const completedMatches = matches.length;
  if (completedMatches === 0) {
    return { config, matches, aggregates: agg, invariantFailures: allInvariantFailures };
  }

  for (const match of matches) {
    const fs = match.finalState;
    agg.homeGoals += fs.score.home;
    agg.awayGoals += fs.score.away;
    agg.totalGoals += (fs.score.home + fs.score.away);
    
    agg.totalShots += (fs.homeStats.shots + fs.awayStats.shots);
    agg.totalShotsOnTarget += (fs.homeStats.shotsOnTarget + fs.awayStats.shotsOnTarget);
    agg.totalXG += (fs.homeStats.xG + fs.awayStats.xG);
    agg.totalPossessionSeconds += (fs.homeStats.possessionSeconds + fs.awayStats.possessionSeconds);

    if (fs.score.home > fs.score.away) agg.homeWins++;
    else if (fs.score.away > fs.score.home) agg.awayWins++;
    else agg.draws++;
  }

  agg.averageGoalsPerMatch = agg.totalGoals / completedMatches;
  agg.averageShotsPerTeam = agg.totalShots / (completedMatches * 2);
  agg.averageShotsOnTargetPerTeam = agg.totalShotsOnTarget / (completedMatches * 2);
  agg.averageXGPerTeam = agg.totalXG / (completedMatches * 2);
  
  agg.homeWinRate = agg.homeWins / completedMatches;
  agg.drawRate = agg.draws / completedMatches;
  agg.awayWinRate = agg.awayWins / completedMatches;

  return {
    config,
    matches,
    aggregates: agg,
    invariantFailures: allInvariantFailures
  };
}
