import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LogDomain, LoggerService } from './LoggerService';

describe('LoggerService', () => {
    let service: LoggerService;

    beforeEach(() => {
        service = LoggerService.getInstance();
        service.setDevelopmentMode(false); // Default to JSON output
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'info').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'debug').mockImplementation(() => {});
    });

    it('should log messages in development mode with formatting', () => {
        service.setDevelopmentMode(true);
        const logSpy = vi.spyOn(console, 'log');
        
        service.info('Dev message', { key: 'val' });
        
        expect(logSpy).toHaveBeenCalledWith(
            expect.stringContaining('[INFO] [CORE]'),
            expect.any(String),
            'Dev message',
            { key: 'val' }
        );

        service.info('Dev message no data');
        expect(logSpy).toHaveBeenCalledWith(
            expect.stringContaining('[INFO] [CORE]'),
            expect.any(String),
            'Dev message no data'
        );
    });

    it('should support setting a default domain', () => {
        service.setDefaultDomain(LogDomain.GAME);
        const infoSpy = vi.spyOn(console, 'info');
        
        service.info('Game message');
        
        const output = JSON.parse(infoSpy.mock.calls[0][0]);
        expect(output.source_domain).toBe('GAME');
    });

    it('should provide debug logs', () => {
        const debugSpy = vi.spyOn(console, 'debug');
        service.debug('Debug message');
        expect(debugSpy).toHaveBeenCalled();
    });

    it('should return correct colors for levels', () => {
        service.setDevelopmentMode(true);
        const logSpy = vi.spyOn(console, 'log');
        
        service.debug('d');
        expect(logSpy.mock.calls[0][1]).toBe('color: #888');

        service.info('i');
        expect(logSpy.mock.calls[1][1]).toBe('color: #00ff00');

        service.warn('w');
        expect(logSpy.mock.calls[2][1]).toBe('color: #ffaa00');

        service.error('e');
        expect(logSpy.mock.calls[3][1]).toBe('color: #ff0000; font-weight: bold');
    });
});
