export interface MatchWorkerHeartbeatMessage {
    type: 'heartbeat';
    timestamp: number;
    sequence: number;
}

export type MatchWorkerMessage = MatchWorkerHeartbeatMessage;

let heartbeatSequence = 0;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Starts the worker simulation loop and heartbeats.
 */
export function start(): void {
    if (heartbeatInterval) return;

    heartbeatInterval = setInterval(() => {
        heartbeatSequence += 1;

        postMessage({
            type: 'heartbeat',
            timestamp: Date.now(),
            sequence: heartbeatSequence
        } satisfies MatchWorkerHeartbeatMessage);
    }, 1_000);
}

// Worker isolation rule: keep this file free of DOM, React, and Phaser imports.
// Auto-start when loaded as a worker entry point.
start();

