import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMatchWorkerClientForTests } from '../MatchWorkerClient';
import { useMatchWorker } from './useMatchWorker';

class MockWorker extends EventTarget {
    public terminate = vi.fn();

    public constructor() {
        super();
        MockWorker.instances += 1;
    }

    public static instances = 0;
}

function MatchWorkerHarness(): null {
    useMatchWorker();
    return null;
}

describe('useMatchWorker', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeAll(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    });

    beforeEach(() => {
        resetMatchWorkerClientForTests();
        MockWorker.instances = 0;
        vi.stubGlobal('Worker', MockWorker);
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

    it('bootstraps the match worker once when mounted', () => {
        act(() => {
            root.render(<MatchWorkerHarness />);
        });

        expect(MockWorker.instances).toBe(1);
    });
});
