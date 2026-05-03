import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DebugCommandService } from './DebugCommandService';
import { useEconomyStore } from '../../store/useEconomyStore';
import { useDebugStore } from '../../store/useDebugStore';

describe('DebugCommandService', () => {
    let service: DebugCommandService;

    beforeEach(() => {
        service = DebugCommandService.getInstance();
        useEconomyStore.getState().setPrestige(0);
        useDebugStore.getState().clearLogs();
    });

    it('should parse and execute /add_prestige command', () => {
        service.execute('/add_prestige 500');
        expect(useEconomyStore.getState().prestige).toBe(500);
    });

    it('should parse and execute /clear_logs command', () => {
        useDebugStore.getState().addLog({
            timestamp: new Date().toISOString(),
            level: 'INFO' as any,
            source_domain: 'CORE' as any,
            message: 'Test log'
        });
        
        expect(useDebugStore.getState().logs.length).toBe(1);
        service.execute('/clear_logs');
        // It should be 1 because the command itself logs "Console logs cleared" after clearing
        expect(useDebugStore.getState().logs.length).toBe(1);
        expect(useDebugStore.getState().logs[0].message).toBe('Console logs cleared');
    });

    it('should log an error for unknown commands', () => {
        service.execute('/unknown_cmd');
        const logs = useDebugStore.getState().logs;
        expect(logs[0].message).toContain('Unknown command: unknown_cmd');
    });

    it('should log a warning for invalid format', () => {
        service.execute('invalid_format');
        const logs = useDebugStore.getState().logs;
        expect(logs[0].message).toContain('Invalid command format');
    });
});
