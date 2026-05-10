import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FlowService } from '@core/fsm/FlowService';
import { GameState } from '@core/fsm/GameState';
import { useSquadStore } from '@domains/shared/store/useSquadStore';
import { LineupService } from '@domains/shared/services/LineupService';
import HubScreen from './HubScreen';

// Mock useMatchWorker
vi.mock('@domains/match/hooks/useMatchWorker', () => ({
    useMatchWorker: () => ({
        terminate: vi.fn(),
    }),
}));

// Mock FlowService
const mockNavigateTo = vi.fn();
vi.mock('@core/fsm/FlowService', () => ({
    FlowService: {
        getInstance: () => ({
            navigateTo: mockNavigateTo,
        }),
    },
}));

describe('HubScreen', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        document.body.removeChild(container);
        mockNavigateTo.mockClear();
    });

    it('renders the team name and division from the store', () => {
        act(() => {
            root.render(<HubScreen />);
        });

        expect(container.textContent).toContain('STRIKER_COMMAND');
        expect(container.textContent).toContain('hub.division_label 4');
    });

    it('navigates to tactics screen when clicking the composition panel', () => {
        act(() => {
            root.render(<HubScreen />);
        });

        const tacticsButton = container.querySelector('button[aria-label*="hub.composition_label"]') as HTMLButtonElement;

        act(() => {
            tacticsButton.click();
        });

        expect(mockNavigateTo).toHaveBeenCalledWith(GameState.TACTICS);
    });

    it('navigates to main menu when clicking the home button', () => {
        act(() => {
            root.render(<HubScreen />);
        });

        const homeButton = container.querySelector('button[aria-label*="common.back_to_menu"]') as HTMLButtonElement;
        
        act(() => {
            homeButton.click();
        });

        expect(mockNavigateTo).toHaveBeenCalledWith(GameState.BOOT);
    });

    it('disables the play button if lineup is incomplete', () => {
        // Force incomplete lineup (0 assigned players)
        useSquadStore.setState({
            lineupSlots: LineupService.createEmptyLineup('4-4- DIAMOND'),
        });

        act(() => {
            root.render(<HubScreen />);
        });

        const playButton = container.querySelector('button[aria-label*="hub.play_button"]') as HTMLButtonElement;
        expect(playButton.disabled).toBe(true);
        expect(playButton.innerHTML).toContain('lock');
    });
});
