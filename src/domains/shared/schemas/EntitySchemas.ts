import { z } from 'zod';

export const PlayerRarity = z.enum(['Common', 'Rare', 'Epic', 'Legendary']);
export const PlayerPosition = z.enum([
    'GK',
    'LB',
    'CB',
    'RB',
    'CDM',
    'CM',
    'CAM',
    'LW',
    'RW',
    'ST'
]);

export const PlayerStatsSchema = z.object({
    pace: z.number().min(0).max(100),
    shooting: z.number().min(0).max(100),
    passing: z.number().min(0).max(100),
    dribbling: z.number().min(0).max(100),
    defense: z.number().min(0).max(100),
    physical: z.number().min(0).max(100)
}).strict();

export const PlayerSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    rarity: PlayerRarity,
    position: PlayerPosition,
    stats: PlayerStatsSchema,
    level: z.number().int().min(1),
    xp: z.number().int().min(0),
    age: z.number().int().min(15).max(45)
}).strict();

export const TeamSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    roster: z.array(z.union([PlayerSchema, z.string().min(1)])).min(1),
    formation: z.string().min(1)
}).strict();

export type Player = z.infer<typeof PlayerSchema>;
export type Team = z.infer<typeof TeamSchema>;
