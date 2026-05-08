import { MatchState, MatchStateSchema } from './MatchState';
import { getForwardZones, getBackwardZones, getMatchZone, MatchZoneId } from './MatchZone';
import { createPRNG } from '../../../utils/Random';

const SHOT_RESOLUTION_CONFIG = {
  xgShootValueWeight: 0.65,
  xgDistanceWeight: 0.35,
  xgBaseScale: 0.18, // Adjusted to target ~2.5-3.0 goals per match
  neutralShootingSkill: 50,
  skillImpact: 0.5,
  maxXG: 0.95,
  shotProbabilityScale: 0.08, // Adjusted to target ~10-15 shots per team
  saveWindowMultiplier: 1.2, // Goalkeepers more effective
  maxSaveThreshold: 0.95, // Higher cap for saves
  tickSeconds: 5,
  maxTurnoverShift: 0.15, // Maximum 15% shift based on rating difference
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

const FATIGUE_CONFIG = {
  baseDrainPerTick: (0.05 / 60) * 5, // Exactly 0.05% per minute (AC 1)
  tacticalModifiers: {
    'balanced': 1.0,
    'high-press': 1.18,      // AC 1: 1.18x
    'low-block': 0.92,       // AC 1: 0.92x
    'wing-play': 1.10,       // AC 1: 1.1x
    'direct-transition': 1.08 // AC 1: 1.08x
  } as Record<string, number>,
  staminaImpactOnSkill: 0.15, // 100% stamina = 1.0x, 0% stamina = 0.85x
} as const;

/**
 * Calculates the Expected Goals (xG) for a shot from a specific zone.
 */
export function calculateXG(zoneId: MatchZoneId, rating: TeamRating): number {
  const shootingSkill = rating.shooting;
  const stamina = Number.isFinite(rating.stamina) ? rating.stamina : 100;
  
  const safeShootingSkill = Number.isFinite(shootingSkill)
    ? clamp(shootingSkill, 0, 100)
    : SHOT_RESOLUTION_CONFIG.neutralShootingSkill;
  
  const zone = getMatchZone(zoneId);
  const distanceThreat = 1 - zone.coefficients.distanceToGoal;
  const zoneThreat =
    zone.coefficients.shootValue * SHOT_RESOLUTION_CONFIG.xgShootValueWeight +
    distanceThreat * SHOT_RESOLUTION_CONFIG.xgDistanceWeight;
  
  // Apply fatigue malus: 100% stamina = 1.0, 50% stamina = 0.925 (with 0.15 impact)
  const fatigueModifier = 1 - (1 - stamina / 100) * FATIGUE_CONFIG.staminaImpactOnSkill;
  
  const skillDelta = (safeShootingSkill - SHOT_RESOLUTION_CONFIG.neutralShootingSkill) / 100;
  const skillMultiplier = (1 + skillDelta * SHOT_RESOLUTION_CONFIG.skillImpact) * fatigueModifier;
  
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
  const rating = attackingTeam === 'home' ? state.homeRating : state.awayRating;
  const stats = attackingTeam === 'home' ? nextState.homeStats : nextState.awayStats;
  
  // 1. Calculate xG with stamina impact
  const xG = calculateXG(state.ballZone, rating);
  stats.shots += 1;
  stats.xG += xG;

  const roll = rng();
  
  // 2. Determine Outcome
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

function updateFatigue(state: MatchState): void {
  const homeModifier = FATIGUE_CONFIG.tacticalModifiers[state.homeTactic] ?? 1.0;
  const awayModifier = FATIGUE_CONFIG.tacticalModifiers[state.awayTactic] ?? 1.0;

  state.homeRating.stamina = clamp(
    state.homeRating.stamina - FATIGUE_CONFIG.baseDrainPerTick * homeModifier,
    0,
    100
  );
  state.awayRating.stamina = clamp(
    state.awayRating.stamina - FATIGUE_CONFIG.baseDrainPerTick * awayModifier,
    0,
    100
  );
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
    awayStats: { ...activeState.awayStats },
    homeRating: { ...activeState.homeRating },
    awayRating: { ...activeState.awayRating },
  };

  // 1. Advance Clock
  const totalSeconds = activeState.minute * 60 + activeState.second + SHOT_RESOLUTION_CONFIG.tickSeconds;
  nextState.minute = Math.floor(totalSeconds / 60);
  nextState.second = totalSeconds % 60;

  // 1.5 Update Fatigue
  updateFatigue(nextState);

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

  // Dynamic turnover based on control difference (now factoring in stamina)
  const homeEffectiveControl = nextState.homeRating.control * (1 - (1 - nextState.homeRating.stamina / 100) * FATIGUE_CONFIG.staminaImpactOnSkill);
  const awayEffectiveControl = nextState.awayRating.control * (1 - (1 - nextState.awayRating.stamina / 100) * FATIGUE_CONFIG.staminaImpactOnSkill);

  const attackingControl = activeState.possessionTeam === 'home' 
    ? homeEffectiveControl 
    : awayEffectiveControl;
  const defendingControl = activeState.possessionTeam === 'home' 
    ? awayEffectiveControl 
    : homeEffectiveControl;
  
  const controlDelta = attackingControl - defendingControl;
  const turnoverShift = (controlDelta / 100) * SHOT_RESOLUTION_CONFIG.maxTurnoverShift;
  
  // Base boundaries: Forward 0.30, Lateral 0.60, Backward 0.70, Turnover 1.00
  // Apply shift to turnover (0.70 + shift)
  const turnoverBoundary = clamp(0.70 + turnoverShift, 0.55, 0.85);
  
  // Distribute remaining probability to Forward and Lateral
  const forwardBoundary = turnoverBoundary * 0.43; // ~30% of total if turnoverBoundary is 0.70
  const lateralBoundary = turnoverBoundary * 0.86; // ~60% of total if turnoverBoundary is 0.70

  /**
   * Move Probability Table (Dynamic):
   * 0.00 - forwardBoundary: Forward
   * forwardBoundary - lateralBoundary: Lateral
   * lateralBoundary - turnoverBoundary: Backward
   * turnoverBoundary - 1.00: Turnover
   */
  if (moveRoll < forwardBoundary) {
    const forward = getForwardZones(activeState.ballZone, activeState.possessionTeam);
    if (forward.length > 0) {
      nextState.ballZone = pickOne(forward, rng);
    }
  } else if (moveRoll < lateralBoundary) {
    const lateral = currentZone.lateralZones;
    if (lateral.length > 0) {
      nextState.ballZone = pickOne(lateral, rng);
    }
  } else if (moveRoll < turnoverBoundary) {
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
