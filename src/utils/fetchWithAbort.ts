/**
 * Enhanced fetch utility with AbortController support for request cancellation
 * Prevents memory leaks and orphaned network requests
 */

import { logger } from '../services/loggerService';

export interface FetchWithAbortOptions extends RequestInit {
  timeout?: number;
  requestId?: string;
}

export class AbortError extends Error {
  constructor(message: string = 'Request was cancelled') {
    super(message);
    this.name = 'AbortError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

let requestCounter = 0;

function generateRequestId(): string {
  return `req_${Date.now()}_${++requestCounter}`;
}

function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Keep only protocol, host, and pathname for logging
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch {
    return '[invalid-url]';
  }
}

/**
 * Fetch with automatic timeout and abort support
 * @param url - Request URL
 * @param options - Extended fetch options with timeout
 * @returns Response or throws AbortError/TimeoutError
 */
export async function fetchWithAbort(
  url: string,
  options: FetchWithAbortOptions = {},
): Promise<Response> {
  const {
    timeout = 30000, // 30s default timeout
    requestId = generateRequestId(),
    signal: externalSignal,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isAborted = false;

  // Combine external signal with our timeout signal
  if (externalSignal) {
    if (externalSignal.aborted) {
      throw new AbortError('Request aborted before starting');
    }

    // Listen to external signal
    externalSignal.addEventListener('abort', () => {
      isAborted = true;
      controller.abort();
    });
  }

  // Set up timeout
  if (timeout > 0) {
    timeoutId = setTimeout(() => {
      if (!isAborted) {
        isAborted = true;
        controller.abort();
      }
    }, timeout);
  }

  const startTime = Date.now();

  logger.info('HTTP Request started', {
    requestId,
    method: fetchOptions.method ?? 'GET',
    url: sanitizeUrl(url),
    timeout,
  });

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const duration = Date.now() - startTime;

    logger.info('HTTP Response received', {
      requestId,
      status: response.status,
      statusText: response.statusText,
      duration,
    });

    return response;
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const duration = Date.now() - startTime;

    // Determine error type
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        const abortError =
          isAborted && duration >= timeout
            ? new TimeoutError(`Request timed out after ${timeout}ms`)
            : new AbortError('Request was cancelled');

        logger.warn('HTTP Request cancelled', {
          requestId,
          reason: abortError.name,
          duration,
        });

        throw abortError;
      }

      logger.error('HTTP Request failed', error, {
        requestId,
        duration,
      });

      throw error;
    }

    // Non-Error object thrown
    const unknownError = new Error(String(error));
    logger.error('HTTP Request failed with unknown error', unknownError, {
      requestId,
      duration,
    });

    throw unknownError;
  }
}

/**
 * Create an AbortController that can be shared across multiple requests
 * Useful for cancelling all requests when a component unmounts
 */
export class RequestCanceller {
  private controller: AbortController;

  constructor() {
    this.controller = new AbortController();
  }

  get signal(): AbortSignal {
    return this.controller.signal;
  }

  cancel(): void {
    this.controller.abort();
  }

  isAborted(): boolean {
    return this.controller.signal.aborted;
  }

  reset(): void {
    this.controller = new AbortController();
  }
}

/**
 * React hook for managing request cancellation in components
 * Automatically cancels all requests when component unmounts
 */
export function createRequestCanceller(): RequestCanceller {
  return new RequestCanceller();
}
