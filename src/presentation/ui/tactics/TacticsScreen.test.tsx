import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { LineupService } from '@domains/shared/services/LineupService';
import { useSquadStore } from '@domains/shared/store/useSquadStore';
import TacticsScreen from './TacticsScreen';

const changeSelectByLabel = (container: HTMLElement, label: string, value: string): void => {
    const select = container.querySelector(`select[aria-label="${label}"]`);

    if (!(select instanceof HTMLSelectElement)) throw new Error(`Select not found: ${label}`);

    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
};

describe('TacticsScreen', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeAll(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    });

    beforeEach(() => {
        localStorage.clear();
        useSquadStore.setState({
            formation: '4-4-2 DIAMOND',
            lineupSlots: LineupService.createEmptyLineup('4-4-2 DIAMOND'),
            benchSlots: LineupService.createEmptyBench(),
            gameInstruction: 'balanced',
            roster: [],
        });
        useSquadStore.getState().initializeRoster(true);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
    });

    it('updates formation layout and game instruction through the rendered controls', () => {
        act(() => {
            root.render(<TacticsScreen />);
        });

        act(() => {
            changeSelectByLabel(container, 'Choisir la tactique', '4-3-3');
        });

        expect(useSquadStore.getState().formation).toBe('4-3-3');
        expect(container.querySelector('[data-testid="pitch-lw"]')).not.toBeNull();

        act(() => {
            changeSelectByLabel(container, 'Choisir la consigne', 'high-press');
        });

        expect(useSquadStore.getState().gameInstruction).toBe('high-press');
    });

    it('places a selected squad player on a pitch slot as a mobile fallback to drag and drop', () => {
        act(() => {
            root.render(<TacticsScreen />);
        });
        act(() => {
            changeSelectByLabel(container, 'Choisir la tactique', '4-3-3');
        });

        const striker = useSquadStore.getState().roster.find((player) => player.mainPosition === 'ST');
        expect(striker).toBeDefined();

        const playerButton = container.querySelector(`button[aria-label="Afficher les statistiques de ${striker!.name}"]`);
        const pitchSlot = container.querySelector('[data-testid="pitch-st"]');
        expect(playerButton).not.toBeNull();
        expect(pitchSlot).not.toBeNull();

        act(() => {
            playerButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        act(() => {
            pitchSlot!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(useSquadStore.getState().lineupSlots.st).toBe(striker!.id);
    });
});
