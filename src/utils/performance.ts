/**
 * Performance Monitoring Utilities
 * Tracks app performance metrics and provides optimization insights
 */

import { logger } from '@/src/services/LoggerService';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = __DEV__;

  /**
   * Start tracking a performance metric
   */
  public start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    this.metrics.set(name, {
      name,
      startTime: Date.now(),
      metadata,
    });

    logger.info(`Performance: ${name} started`, 'PERFORMANCE', metadata);
  }

  /**
   * End tracking and log the duration
   */
  public end(name: string, metadata?: Record<string, any>): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Performance: ${name} was never started`, 'PERFORMANCE');
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;
    metric.metadata = { ...metric.metadata, ...metadata };

    logger.info(
      `Performance: ${name} completed in ${duration}ms`,
      'PERFORMANCE',
      metric.metadata
    );

    // Warn if operation is slow
    if (duration > 1000) {
      logger.warn(
        `Performance: ${name} took ${duration}ms (slow operation detected)`,
        'PERFORMANCE',
        metric.metadata
      );
    }

    this.metrics.delete(name);
    return duration;
  }

  /**
   * Measure an async operation
   */
  public async measure<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await operation();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name, { error: true });
      throw error;
    }
  }

  /**
   * Measure a synchronous operation
   */
  public measureSync<T>(
    name: string,
    operation: () => T,
    metadata?: Record<string, any>
  ): T {
    this.start(name, metadata);
    try {
      const result = operation();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name, { error: true });
      throw error;
    }
  }

  /**
   * Get all active metrics
   */
  public getActiveMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Check for slow operations in progress
   */
  public checkForSlowOperations(thresholdMs: number = 2000): PerformanceMetric[] {
    const now = Date.now();
    const slowOps: PerformanceMetric[] = [];

    this.metrics.forEach((metric) => {
      const duration = now - metric.startTime;
      if (duration > thresholdMs) {
        slowOps.push({
          ...metric,
          duration,
        });
        logger.warn(
          `Performance: ${metric.name} is still running after ${duration}ms`,
          'PERFORMANCE',
          metric.metadata
        );
      }
    });

    return slowOps;
  }

  /**
   * Clear all metrics
   */
  public clear(): void {
    this.metrics.clear();
  }

  /**
   * Enable/disable performance monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring method performance
 */
export function measurePerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const methodName = `${target.constructor.name}.${propertyKey}`;
    return performanceMonitor.measure(methodName, () => originalMethod.apply(this, args));
  };

  return descriptor;
}

/**
 * React hook for measuring component render performance
 */
export function useRenderPerformance(componentName: string) {
  if (!__DEV__) return;

  const renderCount = React.useRef(0);
  const lastRenderTime = React.useRef(Date.now());

  React.useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    logger.info(
      `Component: ${componentName} rendered (count: ${renderCount.current}, time since last: ${timeSinceLastRender}ms)`,
      'PERFORMANCE'
    );

    if (timeSinceLastRender < 16 && renderCount.current > 1) {
      logger.warn(
        `Component: ${componentName} may be re-rendering too frequently (${timeSinceLastRender}ms between renders)`,
        'PERFORMANCE'
      );
    }
  });
}

// Import React for hook
import React from 'react';
