// Production-safe logger utility with debug integration
import { debug as debugManager } from './debug';

const isDevelopment = process.env.NODE_ENV === 'development';
const isServer = typeof window === 'undefined';
const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG === 'true';

// Format arguments for logging
function formatArgs(args: any[]): string {
    return args
        .map(arg => {
            if (typeof arg === 'object' && arg !== null) {
                try {
                    return JSON.stringify(arg);
                } catch {
                    return String(arg);
                }
            }
            return String(arg);
        })
        .join(' ');
}

export const logger = {
  log: (...args: any[]) => {
    const message = formatArgs(args);
    if (isDevelopment || isDebugEnabled) {
      console.log(...args);
      debugManager.info(message);
    }
  },
  
  error: (...args: any[]) => {
    const message = formatArgs(args);
    // Always log errors
    console.error(...args);
    debugManager.error(message);
  },
  
  warn: (...args: any[]) => {
    const message = formatArgs(args);
    if (isDevelopment || isDebugEnabled) {
      console.warn(...args);
      debugManager.warn(message);
    }
  },
  
  info: (...args: any[]) => {
    const message = formatArgs(args);
    if (isDevelopment || isDebugEnabled) {
      console.info(...args);
      debugManager.info(message);
    }
  },
  
  debug: (...args: any[]) => {
    const message = formatArgs(args);
    if (isDevelopment || isDebugEnabled) {
      console.debug(...args);
      debugManager.debug(message);
    }
  },
  
  // Server-only logging (won't appear in browser console)
  server: (...args: any[]) => {
    if (isServer && (isDevelopment || isDebugEnabled)) {
      const message = `[SERVER] ${formatArgs(args)}`;
      console.log('[SERVER]', ...args);
      debugManager.info(message);
    }
  },

  // Structured logging for better debugging
  logEvent: (event: string, data?: any, level: 'info' | 'warn' | 'error' = 'info') => {
    const message = `Event: ${event}`;
    const logData = {
      event,
      data,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    switch (level) {
      case 'error':
        logger.error(message, logData);
        break;
      case 'warn':
        logger.warn(message, logData);
        break;
      default:
        logger.info(message, logData);
    }
  },

  // Performance logging
  time: (label: string) => {
    if (isDevelopment || isDebugEnabled) {
      console.time(label);
    }
  },

  timeEnd: (label: string) => {
    if (isDevelopment || isDebugEnabled) {
      console.timeEnd(label);
    }
  },
};

// Export a simple log function for convenience
export const log = logger.log;

// Export structured logging helpers
export const logEvent = logger.logEvent;
export const logError = (message: string, error: any) => {
  logger.logEvent('error', { message, error: error?.message || error, stack: error?.stack }, 'error');
};
export const logWarning = (message: string, data?: any) => {
  logger.logEvent('warning', { message, ...data }, 'warn');
};
export const logInfo = (message: string, data?: any) => {
  logger.logEvent('info', { message, ...data }, 'info');
};