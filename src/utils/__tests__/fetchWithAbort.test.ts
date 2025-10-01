/**
 * Tests for fetchWithAbort utility
 */

import { fetchWithAbort, AbortError, RequestCanceller } from '../fetchWithAbort';
import { logger } from '../../services/loggerService';

// Mock logger
jest.mock('../../services/loggerService', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

// Mock Response for Node environment
class MockResponse {
  constructor(
    public body: string,
    public init: { status: number; statusText?: string },
  ) {}
  get status() {
    return this.init.status;
  }
  get statusText() {
    return this.init.statusText || 'OK';
  }
  async json() {
    return JSON.parse(this.body);
  }
}

describe('fetchWithAbort', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should successfully fetch data', async () => {
    const mockResponse = new MockResponse('{"data": "test"}', {
      status: 200,
      statusText: 'OK',
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await fetchWithAbort('https://api.example.com/data');

    expect(result).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
    expect(logger.info).toHaveBeenCalledWith(
      'HTTP Request started',
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.example.com/data',
      }),
    );
    expect(logger.info).toHaveBeenCalledWith(
      'HTTP Response received',
      expect.objectContaining({
        status: 200,
        statusText: 'OK',
      }),
    );
  });

  it('should handle timeout by aborting request', () => {
    // This test verifies timeout mechanism is set up correctly
    const mockFetch = jest.fn().mockImplementation(() => new Promise(() => {})); // Never resolves
    (global.fetch as jest.Mock) = mockFetch;

    fetchWithAbort('https://api.example.com/slow', {
      timeout: 5000,
    });

    // Verify setTimeout was called
    expect(jest.getTimerCount()).toBeGreaterThan(0);
  });

  it('should throw AbortError if already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      fetchWithAbort('https://api.example.com/data', {
        signal: controller.signal,
      }),
    ).rejects.toThrow(AbortError);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

    await expect(fetchWithAbort('https://api.example.com/data')).rejects.toThrow('Network failure');

    expect(logger.error).toHaveBeenCalledWith(
      'HTTP Request failed',
      expect.any(Error),
      expect.objectContaining({
        requestId: expect.any(String),
        duration: expect.any(Number),
      }),
    );
  });

  it('should use custom request ID when provided', async () => {
    const mockResponse = new MockResponse('{}', { status: 200 });
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await fetchWithAbort('https://api.example.com/data', {
      requestId: 'custom-id-123',
    });

    expect(logger.info).toHaveBeenCalledWith(
      'HTTP Request started',
      expect.objectContaining({
        requestId: 'custom-id-123',
      }),
    );
  });

  it('should sanitize URL in logs', async () => {
    const mockResponse = new MockResponse('{}', { status: 200 });
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await fetchWithAbort('https://api.example.com/data?apiKey=secret123&token=abc');

    expect(logger.info).toHaveBeenCalledWith(
      'HTTP Request started',
      expect.objectContaining({
        url: 'https://api.example.com/data',
      }),
    );
  });
});

describe('RequestCanceller', () => {
  it('should provide abort signal', () => {
    const canceller = new RequestCanceller();
    expect(canceller.signal).toBeInstanceOf(AbortSignal);
    expect(canceller.isAborted()).toBe(false);
  });

  it('should cancel all requests using same signal', () => {
    const canceller = new RequestCanceller();
    const signal = canceller.signal;

    expect(signal.aborted).toBe(false);

    canceller.cancel();

    expect(signal.aborted).toBe(true);
    expect(canceller.isAborted()).toBe(true);
  });

  it('should reset controller', () => {
    const canceller = new RequestCanceller();
    const firstSignal = canceller.signal;

    canceller.cancel();
    expect(firstSignal.aborted).toBe(true);

    canceller.reset();
    const secondSignal = canceller.signal;

    expect(secondSignal.aborted).toBe(false);
    expect(secondSignal).not.toBe(firstSignal);
  });
});
