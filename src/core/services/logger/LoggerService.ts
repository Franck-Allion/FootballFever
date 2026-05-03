import { useDebugStore } from '../../store/useDebugStore';

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
}

export enum LogDomain {
    CORE = 'CORE',
    MATCH = 'MATCH',
    UI = 'UI',
    PERSISTENCE = 'PERSISTENCE',
    GAME = 'GAME'
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    source_domain: LogDomain;
    message: string;
    data?: Record<string, unknown>;
}

export class LoggerService {
    private static instance: LoggerService;
    private defaultDomain: LogDomain = LogDomain.CORE;
    private isDevelopment: boolean = process.env.NODE_ENV === 'development';

    private constructor() {}

    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }

    public setDefaultDomain(domain: LogDomain): void {
        this.defaultDomain = domain;
    }

    public setDevelopmentMode(isDev: boolean): void {
        this.isDevelopment = isDev;
    }

    public debug(message: string, data?: Record<string, unknown>, domain?: LogDomain): void {
        this.log(LogLevel.DEBUG, message, data, domain);
    }

    public info(message: string, data?: Record<string, unknown>, domain?: LogDomain): void {
        this.log(LogLevel.INFO, message, data, domain);
    }

    public warn(message: string, data?: Record<string, unknown>, domain?: LogDomain): void {
        this.log(LogLevel.WARN, message, data, domain);
    }

    public error(message: string, data?: Record<string, unknown>, domain?: LogDomain): void {
        this.log(LogLevel.ERROR, message, data, domain);
    }

    private log(level: LogLevel, message: string, data?: Record<string, unknown>, domain?: LogDomain): void {
        const sourceDomain = domain || this.defaultDomain;
        const timestamp = new Date().toISOString();

        const entry: LogEntry = {
            timestamp,
            level,
            source_domain: sourceDomain,
            message,
            data
        };

        // Pipe to debug store for in-game console
        useDebugStore.getState().addLog(entry);

        if (this.isDevelopment) {
            const color = this.getLevelColor(level);
            const prefix = `%c[${timestamp}] [${level}] [${sourceDomain}]`;
            if (data) {
                console.log(prefix, color, message, data);
            } else {
                console.log(prefix, color, message);
            }
            return;
        }

        const jsonOutput = JSON.stringify(entry);

        switch (level) {
            case LogLevel.DEBUG:
                console.debug(jsonOutput);
                break;
            case LogLevel.INFO:
                console.info(jsonOutput);
                break;
            case LogLevel.WARN:
                console.warn(jsonOutput);
                break;
            case LogLevel.ERROR:
                console.error(jsonOutput);
                break;
        }
    }

    private getLevelColor(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG: return 'color: #888';
            case LogLevel.INFO: return 'color: #00ff00';
            case LogLevel.WARN: return 'color: #ffaa00';
            case LogLevel.ERROR: return 'color: #ff0000; font-weight: bold';
            default: return 'color: #fff';
        }
    }
}
