export interface MatchWorkerHeartbeatMessage {
    type: 'heartbeat';
    timestamp: number;
    sequence: number;
}

export type MatchWorkerMessage = MatchWorkerHeartbeatMessage;

let heartbeatSequence = 0;

// Worker isolation rule: keep this file free of DOM, React, and Phaser imports.
setInterval(() => {
    heartbeatSequence += 1;

    postMessage({
        type: 'heartbeat',
        timestamp: Date.now(),
        sequence: heartbeatSequence
    } satisfies MatchWorkerHeartbeatMessage);
}, 1_000);
