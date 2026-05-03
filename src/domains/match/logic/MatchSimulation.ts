import { MatchState, MatchStateSchema } from './MatchState';
import { getForwardZones, getBackwardZones, getMatchZone, MatchZoneId } from './MatchZone';
import { createPRNG } from '../../../utils/Random';

const SHOT_RESOLUTION_CONFIG = {
  xgShootValueWeight: 0.65,
  xgDistanceWeight: 0.35,
  xgBaseScale: 0.32,
  neutralShootingSkill: 50,
  skillImpact: 0.5,
  maxXG: 0.95,
  shotProbabilityScale: 0.5,
  saveWindowMultiplier: 1.5,
  maxSaveThreshold: 0.88,
  tickSeconds: 5,
} as const;

/**
 * Helper to pick a random item from an array using a deterministic RNG.
 */
function pickOne<T>(array: T[], rng: () => number): T {
  return array[Math.floor(rng() * array.length)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Calculates the Expected Goals (xG) for a shot from a specific zone.
 */
export function calculateXG(zoneId: MatchZoneId, shootingSkill: number = 50): number {
  const safeShootingSkill = Number.isFinite(shootingSkill)
    ? clamp(shootingSkill, 0, 100)
    : SHOT_RESOLUTION_CONFIG.neutralShootingSkill;
  const zone = getMatchZone(zoneId);
  const distanceThreat = 1 - zone.coefficients.distanceToGoal;
  const zoneThreat =
    zone.coefficients.shootValue * SHOT_RESOLUTION_CONFIG.xgShootValueWeight +
    distanceThreat * SHOT_RESOLUTION_CONFIG.xgDistanceWeight;
  const skillDelta = (safeShootingSkill - SHOT_RESOLUTION_CONFIG.neutralShootingSkill) / 100;
  const skillMultiplier = 1 + skillDelta * SHOT_RESOLUTION_CONFIG.skillImpact;
  
  return clamp(
    zoneThreat * SHOT_RESOLUTION_CONFIG.xgBaseScale * skillMultiplier,
    0,
    SHOT_RESOLUTION_CONFIG.maxXG
  );
}

/**
 * Resolves a shot outcome deterministically.
 */
export function resolveShotForTests(state: MatchState, rng: () => number): MatchState {
  const nextState: MatchState = {
    ...state,
    score: { ...state.score },
    homeStats: { ...state.homeStats },
    awayStats: { ...state.awayStats },
    homeRating: { ...state.homeRating },
    awayRating: { ...state.awayRating },
  };
  const attackingTeam = state.possessionTeam;
  const shootingSkill = attackingTeam === 'home'
    ? state.homeRating.shooting
    : state.awayRating.shooting;
  const stats = attackingTeam === 'home' ? nextState.homeStats : nextState.awayStats;
  
  // 1. Calculate xG
  const xG = calculateXG(state.ballZone, shootingSkill);
  stats.shots += 1;
  stats.xG += xG;

  const roll = rng();
  
  // 2. Determine Outcome
  // We use a simplified model:
  // - Goal if roll < xG
  // - Shot on Target (but saved) if roll < xG * 2 (simplified)
  // - Off-target otherwise
  
  if (roll < xG) {
    // GOAL!
    stats.goals += 1;
    stats.shotsOnTarget += 1;
    if (attackingTeam === 'home') {
      nextState.score.home += 1;
    } else {
      nextState.score.away += 1;
    }
    // Kick-off for the other team
    nextState.possessionTeam = attackingTeam === 'home' ? 'away' : 'home';
    nextState.ballZone = 'MID_CENTER_L';
    nextState.currentPhase = 'KICK_OFF';
  } else if (roll < Math.min(SHOT_RESOLUTION_CONFIG.maxSaveThreshold, xG * SHOT_RESOLUTION_CONFIG.saveWindowMultiplier)) {
    // SAVE
    stats.shotsOnTarget += 1;
    // Goal kick or corner? Simplified to Goal Kick for now
    nextState.possessionTeam = attackingTeam === 'home' ? 'away' : 'home';
    nextState.ballZone = attackingTeam === 'home' ? 'BOX_CENTER_L' : 'DEF_HALF_LEFT';
    nextState.currentPhase = 'GOAL_KICK';
  } else {
    // MISS
    nextState.possessionTeam = attackingTeam === 'home' ? 'away' : 'home';
    nextState.ballZone = attackingTeam === 'home' ? 'BOX_CENTER_L' : 'DEF_HALF_LEFT';
    nextState.currentPhase = 'GOAL_KICK';
  }

  return nextState;
}

/**
 * Advances the match state by one tick (e.g. 5 seconds).
 * Pure function, deterministic based on state.seed and current time.
 */
export function advanceMatchState(state: MatchState): MatchState {
  const activeState = MatchStateSchema.parse(state);

  if (activeState.isComplete) return activeState;

  // Deep clone state to avoid mutations
  const nextState: MatchState = { 
    ...activeState, 
    score: { ...activeState.score },
    homeStats: { ...activeState.homeStats },
    awayStats: { ...activeState.awayStats }
  };

  // 1. Advance Clock
  const totalSeconds = activeState.minute * 60 + activeState.second + SHOT_RESOLUTION_CONFIG.tickSeconds;
  nextState.minute = Math.floor(totalSeconds / 60);
  nextState.second = totalSeconds % 60;

  // Possession tracking
  if (activeState.possessionTeam === 'home') {
    nextState.homeStats.possessionSeconds += SHOT_RESOLUTION_CONFIG.tickSeconds;
  } else {
    nextState.awayStats.possessionSeconds += SHOT_RESOLUTION_CONFIG.tickSeconds;
  }

  // Simple end match logic
  if (nextState.minute >= 90) {
    nextState.isComplete = true;
    return nextState;
  }

  // 2. Deterministic Randomness for this tick
  const tickSeed = activeState.seed + activeState.minute * 1000 + activeState.second;
  const rng = createPRNG(tickSeed);

  // 3. Action Selection
  const currentZone = getMatchZone(activeState.ballZone);
  const canShoot = nextState.currentPhase === 'OPEN_PLAY';
  
  // Probability to shoot depends on zone danger
  const shootProb = currentZone.coefficients.shootValue * SHOT_RESOLUTION_CONFIG.shotProbabilityScale;
  const actionRoll = rng();

  if (canShoot && actionRoll < shootProb) {
    return resolveShotForTests(nextState, rng);
  }

  // 4. Movement Logic (if no shot)
  const moveRoll = rng();

  /**
   * Move Probability Table:
   * 0.00 - 0.50: Forward (50%)
   * 0.50 - 0.75: Lateral (25%)
   * 0.75 - 0.90: Backward (15%)
   * 0.90 - 1.00: Turnover (10%)
   */
  if (moveRoll < 0.50) {
    const forward = getForwardZones(activeState.ballZone, activeState.possessionTeam);
    if (forward.length > 0) {
      nextState.ballZone = pickOne(forward, rng);
    }
  } else if (moveRoll < 0.75) {
    const lateral = currentZone.lateralZones;
    if (lateral.length > 0) {
      nextState.ballZone = pickOne(lateral, rng);
    }
  } else if (moveRoll < 0.90) {
    const backward = getBackwardZones(activeState.ballZone, activeState.possessionTeam);
    if (backward.length > 0) {
      nextState.ballZone = pickOne(backward, rng);
    }
  } else {
    // Turnover
    nextState.possessionTeam = activeState.possessionTeam === 'home' ? 'away' : 'home';
  }

  // 5. Update Phase
  if (nextState.currentPhase === 'KICK_OFF') {
    nextState.currentPhase = 'OPEN_PLAY';
  } else if (nextState.currentPhase === 'GOAL_KICK') {
    nextState.currentPhase = 'OPEN_PLAY';
  }

  return nextState;
}
