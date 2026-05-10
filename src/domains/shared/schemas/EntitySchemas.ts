import { z } from 'zod';

export const PlayerRarity = z.enum(['Common', 'Rare', 'Epic', 'Legendary']);
export const PlayerPosition = z.enum([
    'GK', 'LB', 'CB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'
]);

/**
 * Detailed stats for Field Players
 */
export const FieldPlayerStatsSchema = z.object({
    tackling: z.number().min(0).max(100),
    marking: z.number().min(0).max(100),
    positioning: z.number().min(0).max(100),
    passing: z.number().min(0).max(100),
    vision: z.number().min(0).max(100),
    clearance: z.number().min(0).max(100),
    technique: z.number().min(0).max(100),
    dribbling: z.number().min(0).max(100),
    pace: z.number().min(0).max(100),
    acceleration: z.number().min(0).max(100),
    stamina: z.number().min(0).max(100),
    power: z.number().min(0).max(100),
    duels: z.number().min(0).max(100),
    heading: z.number().min(0).max(100),
    shooting: z.number().min(0).max(100),
    finishing: z.number().min(0).max(100),
    composure: z.number().min(0).max(100)
});

/**
 * Detailed stats for Goalkeepers
 */
export const GoalkeeperStatsSchema = z.object({
    lineSaving: z.number().min(0).max(100),
    reflexes: z.number().min(0).max(100),
    diving: z.number().min(0).max(100),
    oneOnOne: z.number().min(0).max(100),
    aerialClaim: z.number().min(0).max(100),
    cornerClaim: z.number().min(0).max(100),
    handDistribution: z.number().min(0).max(100),
    kicking: z.number().min(0).max(100),
    positioning: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
    composure: z.number().min(0).max(100)
});

export const PlayerSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    rarity: PlayerRarity,
    mainPosition: PlayerPosition,
    secondaryPositions: z.array(PlayerPosition).default([]),

    // Core Dynamic Stats
    stats: z.union([FieldPlayerStatsSchema, GoalkeeperStatsSchema]),

    // RPG & Status Stats
    overallRating: z.number().min(0).max(100),
    morale: z.number().min(0).max(100).default(50),
    condition: z.number().min(0).max(100).default(100), // "Physique" in user request
    stamina: z.number().min(0).max(100).default(100),   // "Endurance" (current)

    // Progression
    level: z.number().int().min(1).default(1),
    xp: z.number().int().min(0).default(0),
    xpGainMultiplier: z.number().min(1.0).default(1.0),
    potential: z.number().min(0).max(100),

    // Identity
    age: z.number().int().min(15).max(45),
    preferredSystem: z.string().default('4-4-2'),
    prestigeValue: z.number().int().min(0),
    portraitUrl: z.string().optional()
}).passthrough();

export const TeamSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    roster: z.array(z.string()).min(1),
    formation: z.string().min(1)
}).passthrough();

export const GameStateSchema = z.object({
    id: z.string().min(1),
    currentState: z.string().min(1),
    currentDivision: z.number().int().min(1).default(1),
    prestige: z.number().int().min(0),
    lastSaved: z.string().datetime()
}).passthrough();

export const TimelineNodeSchema = z.object({
    id: z.string().min(1),
    type: z.enum(['match', 'mercato', 'boss', 'rest']),
    label: z.string().min(1),
    status: z.enum(['completed', 'current', 'locked']),
    opponent: z.string().optional(),
    difficulty: z.enum(['EASY', 'NORMAL', 'HARD', 'CRITICAL']).optional()
});

export const ActiveSynergySchema = z.object({
    id: z.string().min(1),
    icon: z.string().min(1),
    label: z.string().min(1),
    description: z.string().min(1)
});

export type Player = z.infer<typeof PlayerSchema>;
export type FieldPlayerStats = z.infer<typeof FieldPlayerStatsSchema>;
export type GoalkeeperStats = z.infer<typeof GoalkeeperStatsSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type GameStateData = z.infer<typeof GameStateSchema>;
export type TimelineNode = z.infer<typeof TimelineNodeSchema>;
export type ActiveSynergy = z.infer<typeof ActiveSynergySchema>;
