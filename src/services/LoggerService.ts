/**
 * Structured logging service with environment-aware levels
 */

import { LogLevel, LogEntry } from '@/src/types/services';

class LoggerService {
  private static instance: LoggerService;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = __DEV__;
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) {
      return true; // Log everything in development
    }

    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    category?: string,
    data?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      category,
      timestamp: Date.now(),
      data,
      error,
    };
  }

  private formatLog(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const category = entry.category ? `[${entry.category}]` : '';
    const dataStr = entry.data ? `\n${JSON.stringify(entry.data, null, 2)}` : '';
    const errorStr = entry.error ? `\nError: ${entry.error.message}\n${entry.error.stack}` : '';

    return `[${timestamp}] ${entry.level.toUpperCase()} ${category} ${entry.message}${dataStr}${errorStr}`;
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const formatted = this.formatLog(entry);

    switch (entry.level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  }

  public debug(message: string, category?: string, data?: Record<string, unknown>): void {
    const entry = this.createLogEntry('debug', message, category, data);
    this.log(entry);
  }

  public info(message: string, category?: string, data?: Record<string, unknown>): void {
    const entry = this.createLogEntry('info', message, category, data);
    this.log(entry);
  }

  public warn(message: string, category?: string, data?: Record<string, unknown>): void {
    const entry = this.createLogEntry('warn', message, category, data);
    this.log(entry);
  }

  public error(message: string, error?: Error, category?: string, data?: Record<string, unknown>): void {
    const entry = this.createLogEntry('error', message, category, data, error);
    this.log(entry);
  }

  // Specialized logging methods
  public network(message: string, data?: Record<string, unknown>): void {
    this.debug(message, 'NETWORK', data);
  }

  public weather(message: string, data?: Record<string, unknown>): void {
    this.debug(message, 'WEATHER', data);
  }

  public location(message: string, data?: Record<string, unknown>): void {
    this.debug(message, 'LOCATION', data);
  }

  public performance(message: string, data?: Record<string, unknown>): void {
    this.debug(message, 'PERFORMANCE', data);
  }
}

// Export singleton instance
export const logger = LoggerService.getInstance();
