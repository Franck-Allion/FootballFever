import React, { useState, useRef, useEffect } from 'react';
import { useDebugStore } from '@core/store/useDebugStore';
import { DebugCommandService } from '@core/services/debug/DebugCommandService';
import { LogLevel } from '@core/services/logger/LoggerService';

export const DebugConsole: React.FC = () => {
    const { isVisible, logs, toggleVisibility } = useDebugStore();
    const [command, setCommand] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const commandService = DebugCommandService.getInstance();

    useEffect(() => {
        if (isVisible && inputRef.current) {
            inputRef.current.focus();
        }

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isVisible) {
                toggleVisibility();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isVisible, toggleVisibility]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0; // Newest logs are at the top in the store
        }
    }, [logs]);

    if (!isVisible) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (command.trim()) {
            commandService.execute(command);
            setCommand('');
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation();
    };

    const getLogColor = (level: LogLevel) => {
        switch (level) {
            case LogLevel.DEBUG: return 'text-gray-400';
            case LogLevel.INFO: return 'text-green-400';
            case LogLevel.WARN: return 'text-yellow-400';
            case LogLevel.ERROR: return 'text-red-400 font-bold';
            default: return 'text-white';
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-black/80 text-white font-mono text-xs p-4 pointer-events-none">
            <div className="flex justify-between items-center mb-2 pointer-events-auto">
                <h2 className="text-sm font-black tracking-widest text-yellow-500 uppercase">System Console</h2>
                <button 
                    onClick={toggleVisibility}
                    className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded font-bold"
                >
                    CLOSE [ESC]
                </button>
            </div>

            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto mb-4 border border-white/20 p-2 bg-black/40 rounded pointer-events-auto select-text"
            >
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 leading-tight border-b border-white/5 pb-1">
                        <span className="text-gray-500 mr-2">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                        <span className={`${getLogColor(log.level)} mr-2`}>[{log.level}]</span>
                        <span className="text-blue-400 mr-2">[{log.source_domain}]</span>
                        <span>{log.message}</span>
                        {log.data && (
                            <pre className="text-[10px] text-gray-400 mt-1 ml-4 overflow-x-hidden italic">
                                {JSON.stringify(log.data)}
                            </pre>
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 pointer-events-auto">
                <span className="text-yellow-500 font-bold self-center mr-1">{'>'}</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    onKeyUp={handleInputKeyDown}
                    placeholder="Enter command (e.g. /add_prestige 1000)..."
                    className="flex-1 bg-white/10 border border-white/30 rounded px-2 py-2 outline-none focus:border-yellow-500 focus:bg-white/20 transition-all"
                />
                <button 
                    type="submit"
                    className="bg-yellow-600 hover:bg-yellow-700 text-black font-black px-4 py-2 rounded"
                >
                    RUN
                </button>
            </form>
        </div>
    );
};
