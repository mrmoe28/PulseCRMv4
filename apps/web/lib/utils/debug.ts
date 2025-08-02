/**
 * Debug utilities for development and production debugging
 */

interface DebugLog {
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    data?: any;
    timestamp: string;
    stack?: string;
}

class DebugManager {
    private logs: DebugLog[] = [];
    private maxLogs = 1000;
    private enabled: boolean;

    constructor() {
        this.enabled = process.env.NODE_ENV === 'development' || 
                      process.env.NEXT_PUBLIC_DEBUG === 'true';
    }

    private addLog(level: DebugLog['level'], message: string, data?: any) {
        if (!this.enabled && level !== 'error') return;

        const log: DebugLog = {
            level,
            message,
            data,
            timestamp: new Date().toISOString(),
        };

        // Capture stack trace for errors
        if (level === 'error') {
            const error = new Error();
            log.stack = error.stack;
        }

        this.logs.push(log);

        // Keep only the latest logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
            const consoleMethod = level === 'error' ? console.error :
                                level === 'warn' ? console.warn :
                                level === 'debug' ? console.debug :
                                console.log;
            
            consoleMethod(`[${level.toUpperCase()}] ${message}`, data || '');
        }
    }

    info(message: string, data?: any) {
        this.addLog('info', message, data);
    }

    warn(message: string, data?: any) {
        this.addLog('warn', message, data);
    }

    error(message: string, data?: any) {
        this.addLog('error', message, data);
    }

    debug(message: string, data?: any) {
        this.addLog('debug', message, data);
    }

    getLogs(filter?: { level?: DebugLog['level']; limit?: number }) {
        let filtered = this.logs;

        if (filter?.level) {
            filtered = filtered.filter(log => log.level === filter.level);
        }

        if (filter?.limit) {
            filtered = filtered.slice(-filter.limit);
        }

        return filtered;
    }

    clearLogs() {
        this.logs = [];
    }

    exportLogs() {
        return {
            logs: this.logs,
            system: {
                userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV,
            },
        };
    }
}

// Singleton instance
export const debug = new DebugManager();

// Performance monitoring
export class PerformanceMonitor {
    private marks: Map<string, number> = new Map();

    start(label: string) {
        this.marks.set(label, performance.now());
        debug.debug(`Performance: Started measuring "${label}"`);
    }

    end(label: string): number {
        const startTime = this.marks.get(label);
        if (!startTime) {
            debug.warn(`Performance: No start mark found for "${label}"`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.marks.delete(label);
        
        debug.info(`Performance: "${label}" took ${duration.toFixed(2)}ms`);
        
        return duration;
    }

    measure(label: string, fn: () => void): number {
        this.start(label);
        fn();
        return this.end(label);
    }

    async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
        this.start(label);
        try {
            const result = await fn();
            this.end(label);
            return result;
        } catch (error) {
            this.end(label);
            throw error;
        }
    }
}

export const perf = new PerformanceMonitor();

// API request debugging
export function debugApiRequest(
    method: string,
    url: string,
    options?: {
        body?: any;
        headers?: HeadersInit;
        response?: Response;
        error?: Error;
    }
) {
    const debugData = {
        method,
        url,
        timestamp: new Date().toISOString(),
        ...(options?.body && { body: options.body }),
        ...(options?.headers && { headers: options.headers }),
        ...(options?.response && {
            status: options.response.status,
            statusText: options.response.statusText,
        }),
        ...(options?.error && {
            error: options.error.message,
            stack: options.error.stack,
        }),
    };

    if (options?.error) {
        debug.error(`API Request Failed: ${method} ${url}`, debugData);
    } else {
        debug.info(`API Request: ${method} ${url}`, debugData);
    }

    return debugData;
}

// Database query debugging
export function debugDatabaseQuery(
    operation: string,
    table?: string,
    details?: any
) {
    const debugData = {
        operation,
        table,
        details,
        timestamp: new Date().toISOString(),
    };

    debug.debug(`Database: ${operation} on ${table || 'unknown'}`, debugData);
    
    return debugData;
}

// Authentication debugging
export function debugAuth(
    action: string,
    details?: {
        userId?: string;
        email?: string;
        provider?: string;
        error?: string;
    }
) {
    const debugData = {
        action,
        ...details,
        timestamp: new Date().toISOString(),
    };

    if (details?.error) {
        debug.error(`Auth: ${action} failed`, debugData);
    } else {
        debug.info(`Auth: ${action}`, debugData);
    }

    return debugData;
}

// Export all debug data for troubleshooting
export function exportDebugData() {
    return {
        logs: debug.exportLogs(),
        localStorage: typeof window !== 'undefined' ? 
            Object.fromEntries(
                Object.entries(localStorage).map(([key, value]) => {
                    try {
                        return [key, JSON.parse(value)];
                    } catch {
                        return [key, value];
                    }
                })
            ) : {},
        sessionStorage: typeof window !== 'undefined' ?
            Object.fromEntries(
                Object.entries(sessionStorage).map(([key, value]) => {
                    try {
                        return [key, JSON.parse(value)];
                    } catch {
                        return [key, value];
                    }
                })
            ) : {},
        cookies: typeof document !== 'undefined' ? document.cookie : '',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        timestamp: new Date().toISOString(),
    };
}