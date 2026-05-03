import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LogDomain, LoggerService } from '@core/services/logger/LoggerService';
import {
    getMatchWorkerClient,
    resetMatchWorkerClientForTests,
    type MatchWorkerMessage
} from './MatchWorkerClient';

class MockWorker extends EventTarget {
    public readonly url: string | URL;
    public readonly options?: WorkerOptions;
    public terminate = vi.fn();
    public postMessage = vi.fn();

    public constructor(url: string | URL, options?: WorkerOptions) {
        super();
        this.url = url;
        this.options = options;
        MockWorker.instances.push(this);
    }

    public emitMessage(data: MatchWorkerMessage): void {
        this.dispatchEvent(new MessageEvent('message', { data }));
    }

    public static instances: MockWorker[] = [];
}

describe('MatchWorkerClient', () => {
    beforeEach(() => {
        resetMatchWorkerClientForTests();
        MockWorker.instances = [];
        vi.stubGlobal('Worker', MockWorker);
        vi.spyOn(LoggerService.getInstance(), 'info').mockImplementation(() => {});
    });

    it('creates exactly one module worker instance across repeated bootstrap calls', () => {
        const firstClient = getMatchWorkerClient();
        const secondClient = getMatchWorkerClient();

        expect(firstClient).toBe(secondClient);
        expect(MockWorker.instances).toHaveLength(1);
        expect(MockWorker.instances[0]?.options).toEqual({ type: 'module' });
    });

    it('logs heartbeat messages from the worker through LoggerService', () => {
        getMatchWorkerClient();
        const worker = MockWorker.instances[0];

        worker?.emitMessage({
            type: 'heartbeat',
            timestamp: 1_000,
            sequence: 1
        });

        expect(LoggerService.getInstance().info).toHaveBeenCalledWith(
            'Match worker heartbeat received',
            { timestamp: 1_000, sequence: 1 },
            LogDomain.MATCH
        );
    });

    it('logs a warning for unknown message types', () => {
        getMatchWorkerClient();
        const worker = MockWorker.instances[0];
        const warnSpy = vi.spyOn(LoggerService.getInstance(), 'warn').mockImplementation(() => {});

        worker?.emitMessage({
            type: 'unknown_type' as any,
            data: 'test'
        } as any);

        expect(warnSpy).toHaveBeenCalledWith(
            'Match worker received unknown message type',
            expect.any(Object),
            LogDomain.MATCH
        );
    });

    it('logs an error when the worker encounters a lifecycle error', () => {
        getMatchWorkerClient();
        const worker = MockWorker.instances[0];
        const errorSpy = vi.spyOn(LoggerService.getInstance(), 'error').mockImplementation(() => {});

        worker?.dispatchEvent(new ErrorEvent('error', {
            message: 'Worker explosion',
            filename: 'MatchWorker.ts',
            lineno: 42
        }));

        expect(errorSpy).toHaveBeenCalledWith(
            'Match worker error detected',
            {
                message: 'Worker explosion',
                filename: 'MatchWorker.ts',
                lineno: 42
            },
            LogDomain.MATCH
        );
    });
    });
