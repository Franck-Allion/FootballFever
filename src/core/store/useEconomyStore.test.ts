import { describe, expect, it } from 'vitest';
import { useEconomyStore } from './useEconomyStore';

describe('useEconomyStore', () => {
    it('initializes with 0 prestige', () => {
        expect(useEconomyStore.getState().prestige).toBe(0);
    });

    it('adds prestige', () => {
        const { addPrestige } = useEconomyStore.getState();
        addPrestige(100);
        expect(useEconomyStore.getState().prestige).toBe(100);
    });

    it('sets prestige directly', () => {
        const { setPrestige } = useEconomyStore.getState();
        setPrestige(500);
        expect(useEconomyStore.getState().prestige).toBe(500);
    });

    it('resets prestige to 0', () => {
        const { addPrestige, reset } = useEconomyStore.getState();
        addPrestige(1000);
        reset();
        expect(useEconomyStore.getState().prestige).toBe(0);
    });
});
