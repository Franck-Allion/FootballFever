import { z } from 'zod';

/**
 * 20-zone grid model for the match engine.
 * 5 rows (Vertical) x 4 columns (Horizontal)
 */
export const MatchZoneIdSchema = z.enum([
  'DEF_LEFT',      'DEF_HALF_LEFT',      'DEF_HALF_RIGHT',      'DEF_RIGHT',
  'LOWMID_LEFT',   'LOWMID_CENTER_L',    'LOWMID_CENTER_R',     'LOWMID_RIGHT',
  'MID_LEFT',      'MID_CENTER_L',       'MID_CENTER_R',        'MID_RIGHT',
  'HIGH_LEFT',     'HIGH_HALF_LEFT',     'HIGH_HALF_RIGHT',     'HIGH_RIGHT',
  'BOX_LEFT',      'BOX_CENTER_L',       'BOX_CENTER_R',        'BOX_RIGHT',
]);

export type MatchZoneId = z.infer<typeof MatchZoneIdSchema>;

export interface ZoneCoefficients {
  distanceToGoal: number; // 0 (Goal line) to 1 (Own goal line)
  shootValue: number;     // 0 to 1
  crossValue: number;     // 0 to 1
  throughPassValue: number; // 0 to 1
  foulDanger: number;     // 0 to 1
  offsideRisk: number;    // 0 to 1
}

export interface MatchZone {
  id: MatchZoneId;
  row: number; // 0 (DEF) to 4 (BOX)
  col: number; // 0 (LEFT) to 3 (RIGHT)
  coefficients: ZoneCoefficients;
  forwardZones: MatchZoneId[];
  lateralZones: MatchZoneId[];
  backwardZones: MatchZoneId[];
}

export const MATCH_ZONES: Record<MatchZoneId, MatchZone> = {
  // --- DEF ROW (row 0) ---
  DEF_LEFT: {
    id: 'DEF_LEFT', row: 0, col: 0,
    coefficients: { distanceToGoal: 0.9, shootValue: 0.05, crossValue: 0.1, throughPassValue: 0.2, foulDanger: 0.1, offsideRisk: 0.05 },
    forwardZones: ['LOWMID_LEFT', 'LOWMID_CENTER_L'],
    lateralZones: ['DEF_HALF_LEFT'],
    backwardZones: [],
  },
  DEF_HALF_LEFT: {
    id: 'DEF_HALF_LEFT', row: 0, col: 1,
    coefficients: { distanceToGoal: 0.85, shootValue: 0.05, crossValue: 0.1, throughPassValue: 0.3, foulDanger: 0.1, offsideRisk: 0.05 },
    forwardZones: ['LOWMID_CENTER_L', 'LOWMID_CENTER_R', 'LOWMID_LEFT'],
    lateralZones: ['DEF_LEFT', 'DEF_HALF_RIGHT'],
    backwardZones: [],
  },
  DEF_HALF_RIGHT: {
    id: 'DEF_HALF_RIGHT', row: 0, col: 2,
    coefficients: { distanceToGoal: 0.85, shootValue: 0.05, crossValue: 0.1, throughPassValue: 0.3, foulDanger: 0.1, offsideRisk: 0.05 },
    forwardZones: ['LOWMID_CENTER_R', 'LOWMID_CENTER_L', 'LOWMID_RIGHT'],
    lateralZones: ['DEF_HALF_LEFT', 'DEF_RIGHT'],
    backwardZones: [],
  },
  DEF_RIGHT: {
    id: 'DEF_RIGHT', row: 0, col: 3,
    coefficients: { distanceToGoal: 0.9, shootValue: 0.05, crossValue: 0.1, throughPassValue: 0.2, foulDanger: 0.1, offsideRisk: 0.05 },
    forwardZones: ['LOWMID_RIGHT', 'LOWMID_CENTER_R'],
    lateralZones: ['DEF_HALF_RIGHT'],
    backwardZones: [],
  },

  // --- LOWMID ROW (row 1) ---
  LOWMID_LEFT: {
    id: 'LOWMID_LEFT', row: 1, col: 0,
    coefficients: { distanceToGoal: 0.75, shootValue: 0.1, crossValue: 0.3, throughPassValue: 0.4, foulDanger: 0.2, offsideRisk: 0.1 },
    forwardZones: ['MID_LEFT', 'MID_CENTER_L'],
    lateralZones: ['LOWMID_CENTER_L'],
    backwardZones: ['DEF_LEFT', 'DEF_HALF_LEFT'],
  },
  LOWMID_CENTER_L: {
    id: 'LOWMID_CENTER_L', row: 1, col: 1,
    coefficients: { distanceToGoal: 0.7, shootValue: 0.2, crossValue: 0.2, throughPassValue: 0.5, foulDanger: 0.2, offsideRisk: 0.1 },
    forwardZones: ['MID_CENTER_L', 'MID_CENTER_R', 'MID_LEFT'],
    lateralZones: ['LOWMID_LEFT', 'LOWMID_CENTER_R'],
    backwardZones: ['DEF_HALF_LEFT', 'DEF_LEFT', 'DEF_HALF_RIGHT'],
  },
  LOWMID_CENTER_R: {
    id: 'LOWMID_CENTER_R', row: 1, col: 2,
    coefficients: { distanceToGoal: 0.7, shootValue: 0.2, crossValue: 0.2, throughPassValue: 0.5, foulDanger: 0.2, offsideRisk: 0.1 },
    forwardZones: ['MID_CENTER_R', 'MID_CENTER_L', 'MID_RIGHT'],
    lateralZones: ['LOWMID_CENTER_L', 'LOWMID_RIGHT'],
    backwardZones: ['DEF_HALF_RIGHT', 'DEF_RIGHT', 'DEF_HALF_LEFT'],
  },
  LOWMID_RIGHT: {
    id: 'LOWMID_RIGHT', row: 1, col: 3,
    coefficients: { distanceToGoal: 0.75, shootValue: 0.1, crossValue: 0.3, throughPassValue: 0.4, foulDanger: 0.2, offsideRisk: 0.1 },
    forwardZones: ['MID_RIGHT', 'MID_CENTER_R'],
    lateralZones: ['LOWMID_CENTER_R'],
    backwardZones: ['DEF_RIGHT', 'DEF_HALF_RIGHT'],
  },

  // --- MID ROW (row 2) ---
  MID_LEFT: {
    id: 'MID_LEFT', row: 2, col: 0,
    coefficients: { distanceToGoal: 0.55, shootValue: 0.2, crossValue: 0.5, throughPassValue: 0.6, foulDanger: 0.3, offsideRisk: 0.2 },
    forwardZones: ['HIGH_LEFT', 'HIGH_HALF_LEFT'],
    lateralZones: ['MID_CENTER_L'],
    backwardZones: ['LOWMID_LEFT', 'LOWMID_CENTER_L'],
  },
  MID_CENTER_L: {
    id: 'MID_CENTER_L', row: 2, col: 1,
    coefficients: { distanceToGoal: 0.5, shootValue: 0.3, crossValue: 0.3, throughPassValue: 0.7, foulDanger: 0.4, offsideRisk: 0.2 },
    forwardZones: ['HIGH_HALF_LEFT', 'HIGH_HALF_RIGHT', 'HIGH_LEFT'],
    lateralZones: ['MID_LEFT', 'MID_CENTER_R'],
    backwardZones: ['LOWMID_CENTER_L', 'LOWMID_LEFT', 'LOWMID_CENTER_R'],
  },
  MID_CENTER_R: {
    id: 'MID_CENTER_R', row: 2, col: 2,
    coefficients: { distanceToGoal: 0.5, shootValue: 0.3, crossValue: 0.3, throughPassValue: 0.7, foulDanger: 0.4, offsideRisk: 0.2 },
    forwardZones: ['HIGH_HALF_RIGHT', 'HIGH_HALF_LEFT', 'HIGH_RIGHT'],
    lateralZones: ['MID_CENTER_L', 'MID_RIGHT'],
    backwardZones: ['LOWMID_CENTER_R', 'LOWMID_RIGHT', 'LOWMID_CENTER_L'],
  },
  MID_RIGHT: {
    id: 'MID_RIGHT', row: 2, col: 3,
    coefficients: { distanceToGoal: 0.55, shootValue: 0.2, crossValue: 0.5, throughPassValue: 0.6, foulDanger: 0.3, offsideRisk: 0.2 },
    forwardZones: ['HIGH_RIGHT', 'HIGH_HALF_RIGHT'],
    lateralZones: ['MID_CENTER_R'],
    backwardZones: ['LOWMID_RIGHT', 'LOWMID_CENTER_R'],
  },

  // --- HIGH ROW (row 3) ---
  HIGH_LEFT: {
    id: 'HIGH_LEFT', row: 3, col: 0,
    coefficients: { distanceToGoal: 0.35, shootValue: 0.4, crossValue: 0.8, throughPassValue: 0.7, foulDanger: 0.5, offsideRisk: 0.4 },
    forwardZones: ['BOX_LEFT', 'BOX_CENTER_L'],
    lateralZones: ['HIGH_HALF_LEFT'],
    backwardZones: ['MID_LEFT', 'MID_CENTER_L'],
  },
  HIGH_HALF_LEFT: {
    id: 'HIGH_HALF_LEFT', row: 3, col: 1,
    coefficients: { distanceToGoal: 0.3, shootValue: 0.6, crossValue: 0.5, throughPassValue: 0.8, foulDanger: 0.6, offsideRisk: 0.5 },
    forwardZones: ['BOX_CENTER_L', 'BOX_CENTER_R', 'BOX_LEFT'],
    lateralZones: ['HIGH_LEFT', 'HIGH_HALF_RIGHT'],
    backwardZones: ['MID_CENTER_L', 'MID_LEFT', 'MID_CENTER_R'],
  },
  HIGH_HALF_RIGHT: {
    id: 'HIGH_HALF_RIGHT', row: 3, col: 2,
    coefficients: { distanceToGoal: 0.3, shootValue: 0.6, crossValue: 0.5, throughPassValue: 0.8, foulDanger: 0.6, offsideRisk: 0.5 },
    forwardZones: ['BOX_CENTER_R', 'BOX_CENTER_L', 'BOX_RIGHT'],
    lateralZones: ['HIGH_HALF_LEFT', 'HIGH_RIGHT'],
    backwardZones: ['MID_CENTER_R', 'MID_RIGHT', 'MID_CENTER_L'],
  },
  HIGH_RIGHT: {
    id: 'HIGH_RIGHT', row: 3, col: 3,
    coefficients: { distanceToGoal: 0.35, shootValue: 0.4, crossValue: 0.8, throughPassValue: 0.7, foulDanger: 0.5, offsideRisk: 0.4 },
    forwardZones: ['BOX_RIGHT', 'BOX_CENTER_R'],
    lateralZones: ['HIGH_HALF_RIGHT'],
    backwardZones: ['MID_RIGHT', 'MID_CENTER_R'],
  },

  // --- BOX ROW (row 4) ---
  BOX_LEFT: {
    id: 'BOX_LEFT', row: 4, col: 0,
    coefficients: { distanceToGoal: 0.15, shootValue: 0.7, crossValue: 0.6, throughPassValue: 0.6, foulDanger: 0.8, offsideRisk: 0.8 },
    forwardZones: [],
    lateralZones: ['BOX_CENTER_L'],
    backwardZones: ['HIGH_LEFT', 'HIGH_HALF_LEFT'],
  },
  BOX_CENTER_L: {
    id: 'BOX_CENTER_L', row: 4, col: 1,
    coefficients: { distanceToGoal: 0.1, shootValue: 0.9, crossValue: 0.3, throughPassValue: 0.7, foulDanger: 0.9, offsideRisk: 0.9 },
    forwardZones: [],
    lateralZones: ['BOX_LEFT', 'BOX_CENTER_R'],
    backwardZones: ['HIGH_HALF_LEFT', 'HIGH_LEFT', 'HIGH_HALF_RIGHT'],
  },
  BOX_CENTER_R: {
    id: 'BOX_CENTER_R', row: 4, col: 2,
    coefficients: { distanceToGoal: 0.1, shootValue: 0.9, crossValue: 0.3, throughPassValue: 0.7, foulDanger: 0.9, offsideRisk: 0.9 },
    forwardZones: [],
    lateralZones: ['BOX_CENTER_L', 'BOX_RIGHT'],
    backwardZones: ['HIGH_HALF_RIGHT', 'HIGH_RIGHT', 'HIGH_HALF_LEFT'],
  },
  BOX_RIGHT: {
    id: 'BOX_RIGHT', row: 4, col: 3,
    coefficients: { distanceToGoal: 0.15, shootValue: 0.7, crossValue: 0.6, throughPassValue: 0.6, foulDanger: 0.8, offsideRisk: 0.8 },
    forwardZones: [],
    lateralZones: ['BOX_CENTER_R'],
    backwardZones: ['HIGH_RIGHT', 'HIGH_HALF_RIGHT'],
  },
};

/**
 * Utility to get a zone by ID.
 */
export function getMatchZone(id: MatchZoneId): MatchZone {
  const zone = (MATCH_ZONES as Partial<Record<MatchZoneId, MatchZone>>)[id];

  if (!zone) {
    throw new Error(`Unknown match zone: ${id}`);
  }

  return zone;
}

/**
 * Returns the zones that represent progression towards the opponent's goal.
 * Home attacks towards row 4 (BOX).
 * Away attacks towards row 0 (DEF).
 */
export function getForwardZones(id: MatchZoneId, attackingTeam: 'home' | 'away'): MatchZoneId[] {
  const zone = getMatchZone(id);
  if (attackingTeam === 'home') {
    return zone.forwardZones;
  } else {
    return zone.backwardZones;
  }
}

/**
 * Returns the zones that represent retreat towards own goal.
 */
export function getBackwardZones(id: MatchZoneId, attackingTeam: 'home' | 'away'): MatchZoneId[] {
  const zone = getMatchZone(id);
  if (attackingTeam === 'home') {
    return zone.backwardZones;
  } else {
    return zone.forwardZones;
  }
}

/**
 * Validates if a transition between two zones is possible.
 */
export function isValidTransition(fromId: MatchZoneId, toId: MatchZoneId): boolean {
  const fromZone = getMatchZone(fromId);
  return (
    fromZone.forwardZones.includes(toId) ||
    fromZone.lateralZones.includes(toId) ||
    fromZone.backwardZones.includes(toId) ||
    fromId === toId // Same zone is valid (retention)
  );
}
