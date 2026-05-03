import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoggerService, LogLevel, LogDomain } from './LoggerService';

describe('LoggerService', () => {
    let logger: LoggerService;

    beforeEach(() => {
        logger = LoggerService.getInstance();
        logger.setDevelopmentMode(false); // Force JSON mode for most tests
        vi.spyOn(console, 'debug').mockImplementation(() => {});
        vi.spyOn(console, 'info').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('should format log as JSON with correct fields in production mode', () => {
        logger.info('Test message', { foo: 'bar' }, LogDomain.UI);
        
        const call = vi.mocked(console.info).mock.calls[0][0];
        const parsed = JSON.parse(call);

        expect(parsed.message).toBe('Test message');
        expect(parsed.data.foo).toBe('bar');
        expect(parsed.source_domain).toBe(LogDomain.UI);
        expect(parsed.level).toBe(LogLevel.INFO);
        expect(parsed.timestamp).toBeDefined();
    });

    it('should use Pretty Print in development mode', () => {
        logger.setDevelopmentMode(true);
        logger.info('Dev message', { debug: true }, LogDomain.CORE);

        const calls = vi.mocked(console.log).mock.calls[0];
        expect(calls[0]).toContain('[INFO] [CORE]');
        expect(calls[2]).toBe('Dev message');
        expect(calls[3]).toEqual({ debug: true });
    });

    it('should use default domain if not provided', () => {
        logger.setDefaultDomain(LogDomain.CORE);
        logger.debug('Core debug');
        
        const call = vi.mocked(console.debug).mock.calls[0][0];
        const parsed = JSON.parse(call);

        expect(parsed.source_domain).toBe(LogDomain.CORE);
    });

    it('should handle complex data objects', () => {
        const complexData = { id: 1, nested: { active: true } };
        logger.error('Critical failure', complexData);
        
        const call = vi.mocked(console.error).mock.calls[0][0];
        const parsed = JSON.parse(call);

        expect(parsed.data).toEqual(complexData);
    });
});
