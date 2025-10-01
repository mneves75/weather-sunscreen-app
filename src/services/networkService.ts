/**
 * Network connectivity detection service
 * Provides real-time network status monitoring and offline-first fallback support
 *
 * Features:
 * - Real-time connectivity state monitoring
 * - Cached connectivity status (1-second cache to prevent excessive native calls)
 * - Subscribe/unsubscribe pattern for components
 * - Memory-efficient listener management
 *
 * @example
 * ```typescript
 * // Check connectivity before API call
 * if (!(await NetworkService.isConnected())) {
 *   return getCachedData();
 * }
 *
 * // Subscribe to connectivity changes
 * useEffect(() => {
 *   const unsubscribe = NetworkService.subscribeToConnectivity((isConnected) => {
 *     setOffline(!isConnected);
 *   });
 *   return unsubscribe;
 * }, []);
 * ```
 */

import NetInfo from '@react-native-community/netinfo';
import { logger } from './loggerService';
import { TIMINGS } from '../constants/timings';

export class NetworkService {
  private static listeners: Set<(isConnected: boolean) => void> = new Set();
  private static isOnline = true;
  private static lastCheck = 0;
  private static isInitialized = false;

  /**
   * Check if device is connected to the internet
   * Uses 1-second cache to prevent excessive native calls
   *
   * @returns Promise resolving to true if connected
   */
  static async isConnected(): Promise<boolean> {
    const now = Date.now();

    // Return cached value if checked within last second
    if (now - this.lastCheck < TIMINGS.NETWORK_CHECK_CACHE) {
      return this.isOnline;
    }

    try {
      const state = await NetInfo.fetch();
      const isConnected = state.isConnected === true && state.isInternetReachable === true;

      this.isOnline = isConnected;
      this.lastCheck = now;

      logger.info('Network connectivity checked', {
        isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
      });

      return isConnected;
    } catch (error) {
      logger.warn('Network state check failed, using last known state', {
        error: error instanceof Error ? error.message : String(error),
        lastKnownState: this.isOnline,
      });
      return this.isOnline; // Fallback to last known state
    }
  }

  /**
   * Subscribe to network connectivity changes
   * Automatically notifies all listeners when connectivity changes
   *
   * @param callback - Function called when connectivity changes
   * @returns Unsubscribe function
   */
  static subscribeToConnectivity(callback: (isConnected: boolean) => void): () => void {
    this.listeners.add(callback);

    // Initialize NetInfo listener on first subscription
    if (!this.isInitialized) {
      this.initializeListener();
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Initialize the NetInfo listener
   * Only called once on first subscription
   */
  private static initializeListener(): void {
    if (this.isInitialized) return;

    this.isInitialized = true;

    NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected === true && state.isInternetReachable === true;
      const previousState = this.isOnline;

      this.isOnline = isConnected;
      this.lastCheck = Date.now();

      // Only notify listeners if state changed
      if (previousState !== isConnected) {
        logger.info('Network connectivity changed', {
          isConnected,
          type: state.type,
          isInternetReachable: state.isInternetReachable,
        });

        this.notifyListeners(isConnected);
      }
    });

    logger.info('NetworkService initialized', {
      initialState: this.isOnline,
    });
  }

  /**
   * Notify all listeners of connectivity change
   * Catches and logs errors to prevent listener failures from affecting others
   */
  private static notifyListeners(isConnected: boolean): void {
    this.listeners.forEach((listener) => {
      try {
        listener(isConnected);
      } catch (error) {
        logger.error(
          'Network listener callback failed',
          error instanceof Error ? error : new Error(String(error)),
          {
            isConnected,
          },
        );
      }
    });
  }

  /**
   * Get current online status from cache (synchronous)
   * Useful when you need immediate answer without async call
   *
   * @returns Current cached online status
   */
  static getCachedStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Force refresh connectivity status
   * Bypasses cache and fetches current state
   *
   * @returns Promise resolving to current connectivity status
   */
  static async refresh(): Promise<boolean> {
    this.lastCheck = 0; // Clear cache
    return this.isConnected();
  }

  /**
   * Get number of active listeners (for debugging/testing)
   */
  static getListenerCount(): number {
    return this.listeners.size;
  }
}
