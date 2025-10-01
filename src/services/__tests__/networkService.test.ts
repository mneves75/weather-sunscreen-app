import { NetworkService } from '../networkService';
import NetInfo from '@react-native-community/netinfo';

// Mock NetInfo
jest.mock('@react-native-community/netinfo');
const mockedNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

// Mock logger
jest.mock('../loggerService', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('NetworkService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset NetworkService internal state
    (NetworkService as any).listeners = new Set();
    (NetworkService as any).isOnline = true;
    (NetworkService as any).lastCheck = 0;
    (NetworkService as any).isInitialized = false;
  });

  describe('isConnected', () => {
    it('should return true when device is connected', async () => {
      mockedNetInfo.fetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      } as any);

      const result = await NetworkService.isConnected();

      expect(result).toBe(true);
      expect(mockedNetInfo.fetch).toHaveBeenCalled();
    });

    it('should return false when device is not connected', async () => {
      mockedNetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      } as any);

      const result = await NetworkService.isConnected();

      expect(result).toBe(false);
    });

    it('should return false when internet is not reachable', async () => {
      mockedNetInfo.fetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: false,
        type: 'cellular',
      } as any);

      const result = await NetworkService.isConnected();

      expect(result).toBe(false);
    });

    it('should use cached value if checked within 1 second', async () => {
      mockedNetInfo.fetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      } as any);

      // First call
      await NetworkService.isConnected();
      expect(mockedNetInfo.fetch).toHaveBeenCalledTimes(1);

      // Second call within 1 second
      await NetworkService.isConnected();
      expect(mockedNetInfo.fetch).toHaveBeenCalledTimes(1); // No additional call
    });

    it('should refresh after cache expires', async () => {
      mockedNetInfo.fetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      } as any);

      // First call
      await NetworkService.isConnected();
      expect(mockedNetInfo.fetch).toHaveBeenCalledTimes(1);

      // Advance time by 2 seconds
      (NetworkService as any).lastCheck = Date.now() - 2000;

      // Second call after cache expires
      await NetworkService.isConnected();
      expect(mockedNetInfo.fetch).toHaveBeenCalledTimes(2);
    });

    it('should return last known state on error', async () => {
      // First call succeeds
      mockedNetInfo.fetch.mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      } as any);

      await NetworkService.isConnected();

      // Second call fails
      (NetworkService as any).lastCheck = 0; // Clear cache
      mockedNetInfo.fetch.mockRejectedValueOnce(new Error('NetInfo error'));

      const result = await NetworkService.isConnected();

      expect(result).toBe(true); // Returns last known state
    });
  });

  describe('subscribeToConnectivity', () => {
    it('should subscribe to connectivity changes', () => {
      const callback = jest.fn();

      const unsubscribe = NetworkService.subscribeToConnectivity(callback);

      expect(typeof unsubscribe).toBe('function');
      expect(NetworkService.getListenerCount()).toBe(1);
    });

    it('should unsubscribe from connectivity changes', () => {
      const callback = jest.fn();

      const unsubscribe = NetworkService.subscribeToConnectivity(callback);
      expect(NetworkService.getListenerCount()).toBe(1);

      unsubscribe();
      expect(NetworkService.getListenerCount()).toBe(0);
    });

    it('should notify listeners on connectivity change', () => {
      let netInfoListener: ((state: any) => void) | null = null;

      mockedNetInfo.addEventListener.mockImplementation((listener: any) => {
        netInfoListener = listener;
        return jest.fn();
      });

      const callback = jest.fn();
      NetworkService.subscribeToConnectivity(callback);

      // Simulate connectivity change
      netInfoListener?.({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('should not notify listeners if state unchanged', () => {
      let netInfoListener: ((state: any) => void) | null = null;

      mockedNetInfo.addEventListener.mockImplementation((listener: any) => {
        netInfoListener = listener;
        return jest.fn();
      });

      const callback = jest.fn();
      NetworkService.subscribeToConnectivity(callback);

      // Initial state is true (online)
      // Simulate same state
      netInfoListener?.({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      let netInfoListener: ((state: any) => void) | null = null;

      mockedNetInfo.addEventListener.mockImplementation((listener: any) => {
        netInfoListener = listener;
        return jest.fn();
      });

      const errorCallback = jest.fn(() => {
        throw new Error('Listener error');
      });
      const normalCallback = jest.fn();

      NetworkService.subscribeToConnectivity(errorCallback);
      NetworkService.subscribeToConnectivity(normalCallback);

      // Simulate connectivity change
      netInfoListener?.({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });

      // Both should be called despite error
      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
    });
  });

  describe('getCachedStatus', () => {
    it('should return current cached status', () => {
      const status = NetworkService.getCachedStatus();
      expect(typeof status).toBe('boolean');
    });

    it('should return updated status after connectivity check', async () => {
      mockedNetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      } as any);

      await NetworkService.isConnected();

      const cached = NetworkService.getCachedStatus();
      expect(cached).toBe(false);
    });
  });

  describe('refresh', () => {
    it('should bypass cache and fetch fresh status', async () => {
      mockedNetInfo.fetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      } as any);

      // First call
      await NetworkService.isConnected();
      expect(mockedNetInfo.fetch).toHaveBeenCalledTimes(1);

      // Refresh should bypass cache
      await NetworkService.refresh();
      expect(mockedNetInfo.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getListenerCount', () => {
    it('should return correct listener count', () => {
      expect(NetworkService.getListenerCount()).toBe(0);

      const unsubscribe1 = NetworkService.subscribeToConnectivity(jest.fn());
      expect(NetworkService.getListenerCount()).toBe(1);

      const unsubscribe2 = NetworkService.subscribeToConnectivity(jest.fn());
      expect(NetworkService.getListenerCount()).toBe(2);

      unsubscribe1();
      expect(NetworkService.getListenerCount()).toBe(1);

      unsubscribe2();
      expect(NetworkService.getListenerCount()).toBe(0);
    });
  });
});
