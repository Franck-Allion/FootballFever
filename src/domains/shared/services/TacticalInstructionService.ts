export type TacticalInstructionId =
    | 'balanced'
    | 'high-press'
    | 'low-block'
    | 'wing-play'
    | 'direct-transition';

export interface TacticalInstruction {
    id: TacticalInstructionId;
    label: string;
    description: string;
    modifiers: {
        pressingModifier: number;
        defensiveBlockModifier: number;
        widthModifier: number;
        directnessModifier: number;
        riskModifier: number;
        fatigueCostModifier: number;
    };
}

export const TACTICAL_INSTRUCTIONS: TacticalInstruction[] = [
    {
        id: 'balanced',
        label: 'Equilibre',
        description: 'Base neutre sans surcharge tacticale.',
        modifiers: {
            pressingModifier: 1,
            defensiveBlockModifier: 1,
            widthModifier: 1,
            directnessModifier: 1,
            riskModifier: 1,
            fatigueCostModifier: 1,
        },
    },
    {
        id: 'high-press',
        label: 'Pressing haut',
        description: 'Recuperation agressive, fatigue et risque de contres accrus.',
        modifiers: {
            pressingModifier: 1.18,
            defensiveBlockModifier: 0.94,
            widthModifier: 1,
            directnessModifier: 1.04,
            riskModifier: 1.12,
            fatigueCostModifier: 1.18,
        },
    },
    {
        id: 'low-block',
        label: 'Bloc bas',
        description: 'Bloc compact, volume offensif et possession reduits.',
        modifiers: {
            pressingModifier: 0.82,
            defensiveBlockModifier: 1.18,
            widthModifier: 0.92,
            directnessModifier: 0.94,
            riskModifier: 0.88,
            fatigueCostModifier: 0.92,
        },
    },
    {
        id: 'wing-play',
        label: 'Jeu sur ailes',
        description: 'Largeur et centres augmentes avec charge accrue sur les couloirs.',
        modifiers: {
            pressingModifier: 1,
            defensiveBlockModifier: 0.96,
            widthModifier: 1.22,
            directnessModifier: 1.06,
            riskModifier: 1.04,
            fatigueCostModifier: 1.1,
        },
    },
    {
        id: 'direct-transition',
        label: 'Transition directe',
        description: 'Contres plus francs, conservation moins stable.',
        modifiers: {
            pressingModifier: 1.04,
            defensiveBlockModifier: 0.98,
            widthModifier: 1,
            directnessModifier: 1.22,
            riskModifier: 1.1,
            fatigueCostModifier: 1.08,
        },
    },
];

export class TacticalInstructionService {
    public static getInstructions(): TacticalInstruction[] {
        return [...TACTICAL_INSTRUCTIONS];
    }

    public static getInstruction(id: TacticalInstructionId): TacticalInstruction {
        return TACTICAL_INSTRUCTIONS.find((instruction) => instruction.id === id) ?? TACTICAL_INSTRUCTIONS[0]!;
    }
}
