/**
 * Production-ready logging service for the Weather Sunscreen App
 * Provides structured logging with different levels and production safety
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;
  private logLevel: LogLevel;

  constructor() {
    this.isDevelopment = __DEV__;
    this.logLevel = this.isDevelopment ? 'debug' : 'error';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    return `[${timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}`;
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.isDevelopment) return;

    const message = this.formatMessage(entry);

    switch (entry.level) {
      case 'debug':
      case 'info':
        console.log(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
        console.error(message, entry.error);
        break;
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;

    const entry: LogEntry = {
      level: 'debug',
      message,
      timestamp: new Date(),
      context,
    };

    this.logToConsole(entry);
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;

    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date(),
      context,
    };

    this.logToConsole(entry);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;

    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date(),
      context,
    };

    this.logToConsole(entry);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;

    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date(),
      context,
      error,
    };

    this.logToConsole(entry);
  }

  // Convenience methods for common patterns
  apiCall(method: string, url: string, context?: Record<string, unknown>): void {
    this.debug(`API ${method} ${url}`, context);
  }

  apiSuccess(method: string, url: string, duration?: number): void {
    this.info(`API ${method} ${url} success`, duration ? { duration: `${duration}ms` } : undefined);
  }

  apiError(method: string, url: string, error: Error, context?: Record<string, unknown>): void {
    this.error(`API ${method} ${url} failed`, error, context);
  }

  userAction(action: string, context?: Record<string, unknown>): void {
    this.info(`User action: ${action}`, context);
  }

  serviceEvent(service: string, event: string, context?: Record<string, unknown>): void {
    this.info(`${service}: ${event}`, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for other modules
export type { Logger };
