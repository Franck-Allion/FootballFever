import { describe, expect, it, vi } from 'vitest';
import { CommandBus } from './CommandBus';

describe('CommandBus', () => {
    it('is a singleton', () => {
        const instance1 = CommandBus.getInstance();
        const instance2 = CommandBus.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('registers and dispatches commands correctly', async () => {
        const bus = CommandBus.getInstance();
        const handler = vi.fn();
        const commandType = 'TEST_COMMAND';
        
        bus.register(commandType, handler);
        
        const command = { type: commandType, payload: { data: 'test' } };
        await bus.dispatch(command);
        
        expect(handler).toHaveBeenCalledWith(command);
    });

    it('logs error if no handler is registered', async () => {
        const bus = CommandBus.getInstance();
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        await bus.dispatch({ type: 'UNKNOWN_COMMAND' });
        
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No handler registered'));
        consoleSpy.mockRestore();
    });

    it('rethrows and logs error if handler fails', async () => {
        const bus = CommandBus.getInstance();
        const error = new Error('Handler failed');
        const handler = vi.fn().mockRejectedValue(error);
        const commandType = 'FAIL_COMMAND';
        
        bus.register(commandType, handler);
        
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        await expect(bus.dispatch({ type: commandType })).rejects.toThrow('Handler failed');
        expect(consoleSpy).toHaveBeenCalledWith(`CommandBus: Error executing command ${commandType}:`, error);
        
        consoleSpy.mockRestore();
    });
});
