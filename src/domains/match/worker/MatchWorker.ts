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

export interface MatchWorkerStartMatchMessage {
    type: 'start_match';
    matchId: string;
    seed: number;
}

export interface MatchWorkerStopMatchMessage {
    type: 'stop_match';
}

export type MatchWorkerMessage = 
    | MatchWorkerHeartbeatMessage
    | MatchWorkerStateUpdateMessage;

export type MatchWorkerCommand =
    | MatchWorkerStartMatchMessage
    | MatchWorkerStopMatchMessage;

let heartbeatSequence = 0;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let simulationInterval: ReturnType<typeof setInterval> | null = null;

let currentMatchState: MatchState | null = null;

/**
 * Starts the worker heartbeat only.
 */
export function start(): void {
    if (heartbeatInterval) return;

    // Heartbeat every 1s
    heartbeatInterval = setInterval(() => {
        heartbeatSequence += 1;

        postMessage({
            type: 'heartbeat',
            timestamp: Date.now(),
            sequence: heartbeatSequence
        } satisfies MatchWorkerHeartbeatMessage);
    }, 1_000);
}

export function startMatch(command: MatchWorkerStartMatchMessage): void {
    if (simulationInterval) return;

    currentMatchState = createInitialMatchState({
        matchId: command.matchId,
        seed: command.seed
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

export function stopMatch(): void {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }

    currentMatchState = null;
}

export function stop(): void {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }

    stopMatch();
    heartbeatSequence = 0;
}

function handleCommand(event: MessageEvent<MatchWorkerCommand>): void {
    switch (event.data.type) {
        case 'start_match':
            startMatch(event.data);
            break;
        case 'stop_match':
            stopMatch();
            break;
    }
}

// Worker isolation rule: keep this file free of DOM, React, and Phaser imports.
// Loading the worker must not start a match simulation. Matches are command-driven.
addEventListener('message', handleCommand);
start();
