import { MatchState, MatchStateSchema, createInitialMatchState } from '../logic/MatchState';
import { advanceMatchState } from '../logic/MatchSimulation';

export interface MatchWorkerHeartbeatMessage {
    type: 'heartbeat';
    timestamp: number;
    sequence: number;
}

export interface MatchWorkerStateUpdateMessage {
    type: 'state_update';
    state: MatchState;
}

export type MatchWorkerMessage = 
    | MatchWorkerHeartbeatMessage
    | MatchWorkerStateUpdateMessage;

let heartbeatSequence = 0;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let simulationInterval: ReturnType<typeof setInterval> | null = null;

let currentMatchState: MatchState | null = null;
const DEMO_MATCH_SEED = 7_202;

/**
 * Starts the worker simulation loop and heartbeats.
 */
export function start(): void {
    if (heartbeatInterval || simulationInterval) return;

    // Heartbeat every 1s
    heartbeatInterval = setInterval(() => {
        heartbeatSequence += 1;

        postMessage({
            type: 'heartbeat',
            timestamp: Date.now(),
            sequence: heartbeatSequence
        } satisfies MatchWorkerHeartbeatMessage);
    }, 1_000);

    // Initial match setup for Story 7.2 (Demo purposes)
    // In a real flow, this would be triggered by a message.
    currentMatchState = createInitialMatchState({
        matchId: 'DEMO_7_2',
        seed: DEMO_MATCH_SEED
    });

    // Simulation Loop (e.g. 4 updates per second as per constitution rules)
    simulationInterval = setInterval(() => {
        if (!currentMatchState || currentMatchState.isComplete) return;

        currentMatchState = advanceMatchState(currentMatchState);

        postMessage({
            type: 'state_update',
            state: MatchStateSchema.parse(currentMatchState)
        } satisfies MatchWorkerStateUpdateMessage);
    }, 250);
}

export function stop(): void {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }

    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }

    heartbeatSequence = 0;
    currentMatchState = null;
}

// Worker isolation rule: keep this file free of DOM, React, and Phaser imports.
// Auto-start when loaded as a worker entry point.
start();
