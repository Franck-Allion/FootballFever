import { useEffect } from 'react';
import { getMatchWorkerClient } from '../MatchWorkerClient';

export function useMatchWorker(): void {
    useEffect(() => {
        getMatchWorkerClient();
    }, []);
}
