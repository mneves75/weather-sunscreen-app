/**
 * Production diagnostics sink for buffered logging
 * Captures warn/error logs in production for later upload/analysis
 */

import { DiagnosticLog, DiagnosticsBuffer } from '@/src/types/services';

class DiagnosticsSink {
  private static instance: DiagnosticsSink;
  private buffer: DiagnosticsBuffer;
  private readonly MAX_BUFFER_SIZE = 100;
  private isEnabled: boolean;

  private constructor() {
    this.buffer = {
      logs: [],
      maxSize: this.MAX_BUFFER_SIZE,
      enabled: false,
    };
    // Enable diagnostics if flag is set
    this.isEnabled = this.checkDiagnosticsFlag();
    this.buffer.enabled = this.isEnabled;
  }

  public static getInstance(): DiagnosticsSink {
    if (!DiagnosticsSink.instance) {
      DiagnosticsSink.instance = new DiagnosticsSink();
    }
    return DiagnosticsSink.instance;
  }

  private checkDiagnosticsFlag(): boolean {
    // Check for PROD_DIAGNOSTICS environment variable or global flag
    if (typeof global !== 'undefined') {
      return !!(global as any).__PROD_DIAGNOSTICS__;
    }
    return false;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public log(level: 'warn' | 'error', message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.isEnabled) {
      return;
    }

    const diagnosticLog: DiagnosticLog = {
      id: this.generateId(),
      level,
      message,
      timestamp: Date.now(),
      stack: error?.stack,
      context,
    };

    this.buffer.logs.push(diagnosticLog);

    // Implement circular buffer - remove oldest if exceeds max size
    if (this.buffer.logs.length > this.MAX_BUFFER_SIZE) {
      this.buffer.logs.shift();
    }
  }

  public getBufferedLogs(): DiagnosticLog[] {
    return [...this.buffer.logs];
  }

  public clearBufferedLogs(): void {
    this.buffer.logs = [];
  }

  public getBufferInfo(): { count: number; maxSize: number; enabled: boolean } {
    return {
      count: this.buffer.logs.length,
      maxSize: this.buffer.maxSize,
      enabled: this.buffer.enabled,
    };
  }

  public enable(): void {
    this.isEnabled = true;
    this.buffer.enabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
    this.buffer.enabled = false;
  }
}

// Export singleton instance
const diagnosticsSink = DiagnosticsSink.getInstance();

/**
 * Attach diagnostics sink to capture logs
 * Call this in app bootstrap to enable production diagnostics
 */
export function attachDiagnosticsSink(): void {
  diagnosticsSink.enable();

  // Intercept console.warn and console.error
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = function (...args: any[]) {
    const message = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    diagnosticsSink.log('warn', message);
    originalWarn.apply(console, args);
  };

  console.error = function (...args: any[]) {
    const message = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    const error = args.find(arg => arg instanceof Error);
    diagnosticsSink.log('error', message, undefined, error);
    originalError.apply(console, args);
  };
}

/**
 * Get buffered diagnostic logs
 */
export function getBufferedLogs(): DiagnosticLog[] {
  return diagnosticsSink.getBufferedLogs();
}

/**
 * Clear buffered diagnostic logs
 */
export function clearBufferedLogs(): void {
  diagnosticsSink.clearBufferedLogs();
}

/**
 * Get diagnostics buffer info
 */
export function getBufferInfo() {
  return diagnosticsSink.getBufferInfo();
}

export { diagnosticsSink };
