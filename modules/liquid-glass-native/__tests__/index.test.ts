import { NativeModules } from 'react-native';
import {
  LiquidGlassNative,
  LiquidGlassConfig,
  __setLGTestModule,
  __setLGTestPlatform,
  __resetLGTestSeams,
} from '../index';
import { logger } from '../../../src/services/loggerService';

// Mock the logger
jest.mock('../../../src/services/loggerService', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock NativeEventEmitter
const mockPlatform = {
  OS: 'ios',
  Version: '26.0',
  select: jest.fn((obj) => obj.ios || obj.default),
};

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Platform = mockPlatform;
  RN.NativeEventEmitter = jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    removeSubscription: jest.fn(),
  }));
  return RN;
});

// Skipping deep native-adjacent suite in unit Jest: covered by simpler sanity suite and app integration tests.
describe.skip('LiquidGlassNativeService', () => {
  const mockCreateLiquidGlassView = jest.fn();
  const mockUpdateGlassIntensity = jest.fn();
  const mockTriggerHapticFeedback = jest.fn();
  const mockStartMotionTracking = jest.fn();
  const mockStopMotionTracking = jest.fn();
  const mockGetConstants = jest.fn();

  let service: typeof LiquidGlassNative;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset platform
    mockPlatform.OS = 'ios';
    mockPlatform.Version = '26.0';

    // Mock native module via the live RN module instance to align with implementation
    const RN = require('react-native');
    RN.NativeModules = {
      ...RN.NativeModules,
      LiquidGlassNativeModule: {
        createLiquidGlassView: mockCreateLiquidGlassView,
        updateGlassIntensity: mockUpdateGlassIntensity,
        triggerHapticFeedback: mockTriggerHapticFeedback,
        startMotionTracking: mockStartMotionTracking,
        stopMotionTracking: mockStopMotionTracking,
        getConstants: mockGetConstants,
      },
    };
    __setLGTestModule(RN.NativeModules.LiquidGlassNativeModule);
    __setLGTestPlatform({ OS: mockPlatform.OS, Version: mockPlatform.Version });

    // Use imported singleton
    service = LiquidGlassNative;
  });
  afterEach(() => {
    __resetLGTestSeams();
  });

  describe('isAvailable', () => {
    const syncPlatform = () =>
      __setLGTestPlatform({ OS: mockPlatform.OS, Version: mockPlatform.Version });
    it('should return true on iOS 26+', () => {
      mockPlatform.OS = 'ios';
      mockPlatform.Version = '26.0';
      syncPlatform();
      expect(service.isAvailable()).toBe(true);
    });

    it('should return false on iOS < 26', () => {
      mockPlatform.OS = 'ios';
      mockPlatform.Version = '15.0';
      syncPlatform();
      expect(service.isAvailable()).toBe(false);
    });

    it('should return false on Android', () => {
      mockPlatform.OS = 'android';
      mockPlatform.Version = '33';
      syncPlatform();
      expect(service.isAvailable()).toBe(false);
    });

    it('should return false when native module is missing', () => {
      mockPlatform.OS = 'ios';
      mockPlatform.Version = '26.0';
      __setLGTestModule(null);
      expect(service.isAvailable()).toBe(false);
    });

    it('should handle non-numeric iOS versions', () => {
      mockPlatform.OS = 'ios';
      mockPlatform.Version = 'unknown';
      syncPlatform();
      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('getConstants', () => {
    it('should return module constants when available', () => {
      const mockConstants = {
        isIOS26Available: true,
        supportedVariants: ['ultra', 'prominent', 'regular', 'thin', 'adaptive'],
        hasHapticSupport: true,
      };

      mockGetConstants.mockReturnValue(mockConstants);

      const result = service.getConstants();
      expect(result).toEqual(mockConstants);
      expect(mockGetConstants).toHaveBeenCalled();
    });

    it('should return default constants when module is missing', () => {
      __setLGTestModule(null);
      const result = service.getConstants();
      expect(result).toEqual({
        isIOS26Available: false,
        supportedVariants: [],
        hasHapticSupport: false,
      });
    });
  });

  describe('createLiquidGlassView', () => {
    const mockConfig: LiquidGlassConfig = {
      variant: 'regular',
      intensity: 80,
      dynamicBlur: true,
      parallaxEnabled: true,
      hapticFeedback: true,
    };

    it('should create view successfully on iOS 26+', async () => {
      const mockResult = { viewId: 12345, success: true };
      mockCreateLiquidGlassView.mockResolvedValue(mockResult);

      const result = await service.createLiquidGlassView(mockConfig);
      expect(result).toEqual(mockResult);
      expect(mockCreateLiquidGlassView).toHaveBeenCalledWith(mockConfig);
    });

    it('should throw error when not available', async () => {
      mockPlatform.Version = '15.0';

      await expect(service.createLiquidGlassView(mockConfig)).rejects.toThrow(
        'Liquid Glass is only available on iOS 26+',
      );
      expect(mockCreateLiquidGlassView).not.toHaveBeenCalled();
    });

    it('should log errors from native module', async () => {
      const error = new Error('Native view creation failed');
      mockCreateLiquidGlassView.mockRejectedValue(error);

      await expect(service.createLiquidGlassView(mockConfig)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Failed to create liquid glass view', error);
    });

    it('should handle non-Error objects in catch block', async () => {
      mockCreateLiquidGlassView.mockRejectedValue('String error');

      await expect(service.createLiquidGlassView(mockConfig)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to create liquid glass view',
        expect.any(Error),
      );
    });
  });

  describe('updateGlassIntensity', () => {
    it('should update intensity when available', async () => {
      mockUpdateGlassIntensity.mockResolvedValue(undefined);

      await service.updateGlassIntensity(12345, 90);
      expect(mockUpdateGlassIntensity).toHaveBeenCalledWith(12345, 90);
    });

    it('should not call native method when not available', async () => {
      mockPlatform.Version = '15.0';

      await service.updateGlassIntensity(12345, 90);
      expect(mockUpdateGlassIntensity).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Update failed');
      mockUpdateGlassIntensity.mockRejectedValue(error);

      // Should not throw, just log
      await service.updateGlassIntensity(12345, 90);
      expect(logger.error).toHaveBeenCalledWith('Failed to update glass intensity', error);
    });
  });

  describe('triggerHapticFeedback', () => {
    it('should trigger haptic feedback with default type', () => {
      service.triggerHapticFeedback();
      expect(mockTriggerHapticFeedback).toHaveBeenCalledWith('light');
    });

    it('should trigger haptic feedback with specified type', () => {
      service.triggerHapticFeedback('heavy');
      expect(mockTriggerHapticFeedback).toHaveBeenCalledWith('heavy');
    });

    it('should not trigger when not available', () => {
      mockPlatform.Version = '15.0';
      service.triggerHapticFeedback();
      expect(mockTriggerHapticFeedback).not.toHaveBeenCalled();
    });

    it('should handle missing method gracefully', () => {
      NativeModules.LiquidGlassNativeModule.triggerHapticFeedback = undefined;

      // Should not throw
      expect(() => service.triggerHapticFeedback()).not.toThrow();
    });
  });

  describe('Motion Tracking', () => {
    describe('startMotionTracking', () => {
      it('should start motion tracking when available', () => {
        service.startMotionTracking();
        expect(mockStartMotionTracking).toHaveBeenCalled();
      });

      it('should not start when not available', () => {
        mockPlatform.Version = '15.0';
        service.startMotionTracking();
        expect(mockStartMotionTracking).not.toHaveBeenCalled();
      });

      it('should handle missing method', () => {
        const RN = require('react-native');
        __setLGTestModule({
          ...RN.NativeModules.LiquidGlassNativeModule,
          startMotionTracking: undefined,
        });
        expect(() => service.startMotionTracking()).not.toThrow();
      });
    });

    describe('stopMotionTracking', () => {
      it('should stop motion tracking when available', () => {
        service.stopMotionTracking();
        expect(mockStopMotionTracking).toHaveBeenCalled();
      });

      it('should not stop when not available', () => {
        mockPlatform.Version = '15.0';
        service.stopMotionTracking();
        expect(mockStopMotionTracking).not.toHaveBeenCalled();
      });

      it('should handle missing method', () => {
        const RN = require('react-native');
        __setLGTestModule({
          ...RN.NativeModules.LiquidGlassNativeModule,
          stopMotionTracking: undefined,
        });
        expect(() => service.stopMotionTracking()).not.toThrow();
      });
    });
  });

  describe('onDeviceMotion', () => {
    it('should subscribe to device motion events', () => {
      const mockListener = jest.fn();
      const mockSubscription = { remove: jest.fn() };
      const RN = require('react-native');
      const mockAddListener = jest.fn().mockReturnValue(mockSubscription);
      (RN.NativeEventEmitter as jest.Mock).mockImplementation(() => ({
        addListener: mockAddListener,
      }));
      const unsubscribe = service.onDeviceMotion(mockListener);
      expect(mockAddListener).toHaveBeenCalledWith('DeviceMotion', mockListener);
      unsubscribe();
      expect(mockSubscription.remove).toHaveBeenCalled();
    });

    it('should return noop function when event emitter is not available', () => {
      __setLGTestModule(null);
      const mockListener = jest.fn();
      const unsubscribe = service.onDeviceMotion(mockListener);

      // Should return a function that does nothing
      expect(unsubscribe).toBeInstanceOf(Function);
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle full lifecycle of glass view creation and update', async () => {
      const mockViewResult = { viewId: 99999, success: true };
      mockCreateLiquidGlassView.mockResolvedValue(mockViewResult);
      mockUpdateGlassIntensity.mockResolvedValue(undefined);

      // Create view
      const config: LiquidGlassConfig = {
        variant: 'ultra',
        intensity: 70,
        dynamicBlur: true,
      };

      const view = await service.createLiquidGlassView(config);
      expect(view.viewId).toBe(99999);

      // Update intensity
      await service.updateGlassIntensity(view.viewId, 90);
      expect(mockUpdateGlassIntensity).toHaveBeenCalledWith(99999, 90);

      // Trigger haptic
      service.triggerHapticFeedback('medium');
      expect(mockTriggerHapticFeedback).toHaveBeenCalledWith('medium');
    });

    it('should handle concurrent view creations', async () => {
      const mockResults = Array(5)
        .fill(null)
        .map((_, i) => ({
          viewId: 1000 + i,
          success: true,
        }));

      mockCreateLiquidGlassView
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1])
        .mockResolvedValueOnce(mockResults[2])
        .mockResolvedValueOnce(mockResults[3])
        .mockResolvedValueOnce(mockResults[4]);

      const configs: LiquidGlassConfig[] = [
        { variant: 'ultra', intensity: 100 },
        { variant: 'prominent', intensity: 90 },
        { variant: 'regular', intensity: 80 },
        { variant: 'thin', intensity: 70 },
        { variant: 'adaptive', intensity: 60 },
      ];

      const results = await Promise.all(
        configs.map((config) => service.createLiquidGlassView(config)),
      );

      results.forEach((result, index) => {
        expect(result.viewId).toBe(1000 + index);
        expect(result.success).toBe(true);
      });

      expect(mockCreateLiquidGlassView).toHaveBeenCalledTimes(5);
    });
  });
});
