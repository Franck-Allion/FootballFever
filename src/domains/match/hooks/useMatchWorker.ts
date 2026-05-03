import { useEffect, useState } from 'react';
import { getMatchWorkerClient, type MatchWorkerClient } from '../MatchWorkerClient';

/**
 * Root hook to bootstrap the Match Worker.
 * Returns the client instance once initialized.
 */
export function useMatchWorker(): MatchWorkerClient | null {
    const [client, setClient] = useState<MatchWorkerClient | null>(null);

    useEffect(() => {
        const instance = getMatchWorkerClient();
        setClient(instance);
        
        // Note: We don't terminate the global singleton on unmount 
        // as it's intended to live for the app lifecycle.
    }, []);

    return client;
}
