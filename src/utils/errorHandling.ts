/**
 * Standardized error handling utilities for native modules
 * Provides consistent error patterns across all modules
 */

import { logger } from '../services/loggerService';

export enum ErrorSeverity {
  CRITICAL = 'critical', // Operations that must succeed (location, view creation)
  IMPORTANT = 'important', // Data operations with fallbacks (weather, UV)
  OPTIONAL = 'optional', // Nice-to-have operations (haptics, motion)
}

export interface ErrorContext {
  module: string;
  operation: string;
  parameters?: Record<string, any>;
  platform?: string;
}

export class ModuleError extends Error {
  constructor(
    message: string,
    public code: string,
    public context: ErrorContext,
    public severity: ErrorSeverity,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'ModuleError';
  }
}

/**
 * Standardized error handler for native module operations
 */
export class ErrorHandler {
  /**
   * Handle critical operations that must succeed
   * Throws detailed errors with context
   */
  static handleCriticalOperation<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
  ): Promise<T> {
    return this.executeWithErrorHandling(operation, context, ErrorSeverity.CRITICAL);
  }

  /**
   * Handle important operations with fallback support
   * Throws errors but allows caller to provide fallback
   */
  static handleImportantOperation<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
  ): Promise<T> {
    return this.executeWithErrorHandling(operation, context, ErrorSeverity.IMPORTANT);
  }

  /**
   * Handle optional operations that can fail silently
   * Logs warnings but doesn't throw
   */
  static handleOptionalOperation(
    operation: () => void | Promise<void>,
    context: ErrorContext,
  ): void | Promise<void> {
    try {
      const result = operation();
      if (result && typeof (result as Promise<void>).then === 'function') {
        return (result as Promise<void>).catch((error) => {
          const moduleError = new ModuleError(
            `Optional operation failed: ${context.operation}`,
            'OPTIONAL_OPERATION_FAILED',
            context,
            ErrorSeverity.OPTIONAL,
            error instanceof Error ? error : new Error(String(error)),
          );

          logger.warn('Optional operation failed', {
            error: moduleError.message,
            code: moduleError.code,
            context: moduleError.context,
            originalError: moduleError.originalError?.message,
          });
        });
      }
    } catch (error) {
      const moduleError = new ModuleError(
        `Optional operation failed: ${context.operation}`,
        'OPTIONAL_OPERATION_FAILED',
        context,
        ErrorSeverity.OPTIONAL,
        error instanceof Error ? error : new Error(String(error)),
      );

      logger.warn('Optional operation failed', {
        error: moduleError.message,
        code: moduleError.code,
        context: moduleError.context,
        originalError: moduleError.originalError?.message,
      });
    }
  }

  /**
   * Validate input parameters and throw immediately if invalid
   */
  static validateInput(
    validations: Array<{ condition: boolean; message: string; code: string }>,
    context: ErrorContext,
  ): void {
    for (const validation of validations) {
      if (!validation.condition) {
        const error = new ModuleError(
          validation.message,
          validation.code,
          context,
          ErrorSeverity.CRITICAL,
        );

        logger.error('Input validation failed', error, {
          code: error.code,
          context: error.context,
        });

        throw error;
      }
    }
  }

  /**
   * Handle module unavailability with appropriate response
   */
  static handleModuleUnavailable(context: ErrorContext, severity: ErrorSeverity): void {
    const error = new ModuleError(
      `Native module not available: ${context.module}`,
      'MODULE_UNAVAILABLE',
      context,
      severity,
    );

    if (severity === ErrorSeverity.CRITICAL) {
      logger.error('Critical module unavailable', error, {
        code: error.code,
        context: error.context,
      });
      throw error;
    } else if (severity === ErrorSeverity.IMPORTANT) {
      logger.warn('Important module unavailable, fallback recommended', {
        error: error.message,
        code: error.code,
        context: error.context,
      });
      throw error; // Let caller handle fallback
    } else {
      logger.info('Optional module unavailable', {
        module: context.module,
        operation: context.operation,
      });
    }
  }

  /**
   * Internal method to execute operations with standardized error handling
   */
  private static async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    severity: ErrorSeverity,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const moduleError = new ModuleError(
        `Operation failed: ${context.operation}`,
        'OPERATION_FAILED',
        context,
        severity,
        error instanceof Error ? error : new Error(String(error)),
      );

      if (severity === ErrorSeverity.CRITICAL) {
        logger.error('Critical operation failed', moduleError, {
          code: moduleError.code,
          context: moduleError.context,
          originalError: moduleError.originalError?.message,
        });
      } else {
        logger.warn('Important operation failed', {
          error: moduleError.message,
          code: moduleError.code,
          context: moduleError.context,
          originalError: moduleError.originalError?.message,
        });
      }

      throw moduleError;
    }
  }
}

/**
 * Input validation helpers
 */
export class InputValidator {
  static coordinates(latitude: number, longitude: number, context: ErrorContext): void {
    ErrorHandler.validateInput(
      [
        {
          condition: typeof latitude === 'number' && !isNaN(latitude),
          message: 'Latitude must be a valid number',
          code: 'INVALID_LATITUDE_TYPE',
        },
        {
          condition: typeof longitude === 'number' && !isNaN(longitude),
          message: 'Longitude must be a valid number',
          code: 'INVALID_LONGITUDE_TYPE',
        },
        {
          condition: latitude >= -90 && latitude <= 90,
          message: `Invalid latitude: ${latitude}. Must be between -90 and 90`,
          code: 'LATITUDE_OUT_OF_BOUNDS',
        },
        {
          condition: longitude >= -180 && longitude <= 180,
          message: `Invalid longitude: ${longitude}. Must be between -180 and 180`,
          code: 'LONGITUDE_OUT_OF_BOUNDS',
        },
      ],
      context,
    );
  }

  static intensity(intensity: number, context: ErrorContext): void {
    ErrorHandler.validateInput(
      [
        {
          condition: typeof intensity === 'number' && !isNaN(intensity),
          message: 'Intensity must be a valid number',
          code: 'INVALID_INTENSITY_TYPE',
        },
        {
          condition: intensity >= 0 && intensity <= 100,
          message: `Invalid intensity: ${intensity}. Must be between 0 and 100`,
          code: 'INTENSITY_OUT_OF_BOUNDS',
        },
      ],
      context,
    );
  }

  static viewId(viewId: number, context: ErrorContext): void {
    ErrorHandler.validateInput(
      [
        {
          condition: typeof viewId === 'number' && !isNaN(viewId),
          message: 'View ID must be a valid number',
          code: 'INVALID_VIEW_ID_TYPE',
        },
        {
          condition: viewId > 0,
          message: `Invalid view ID: ${viewId}. Must be greater than 0`,
          code: 'INVALID_VIEW_ID',
        },
      ],
      context,
    );
  }

  static hapticType(type: string, context: ErrorContext): void {
    const validTypes = ['light', 'medium', 'heavy', 'selection'];
    ErrorHandler.validateInput(
      [
        {
          condition: typeof type === 'string' && type.length > 0,
          message: 'Haptic type must be a non-empty string',
          code: 'INVALID_HAPTIC_TYPE',
        },
        {
          condition: validTypes.includes(type.toLowerCase()),
          message: `Invalid haptic type: ${type}. Valid types: ${validTypes.join(', ')}`,
          code: 'UNSUPPORTED_HAPTIC_TYPE',
        },
      ],
      context,
    );
  }
}
