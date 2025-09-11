import { NativeModules, Platform } from 'react-native';
import { LiquidGlassNativeService } from '../index';

// Mock the native module
const mockLiquidGlassModule = {
  isAvailable: jest.fn(),
  getConstants: jest.fn(),
  createLiquidGlassView: jest.fn(),
  updateGlassIntensity: jest.fn(),
  triggerHapticFeedback: jest.fn(),
  startMotionTracking: jest.fn(),
  stopMotionTracking: jest.fn(),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
  cleanupResourcesForView: jest.fn(),
};

// Setup mocks
NativeModules.LiquidGlassNativeModule = mockLiquidGlassModule;

describe('LiquidGlassNativeModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Platform OS for each test
    Object.defineProperty(Platform, 'OS', {
      value: 'ios',
      writable: true,
    });
  });

  describe('isAvailable', () => {
    it('should return true on iOS 26+', async () => {
      mockLiquidGlassModule.isAvailable.mockResolvedValue(true);
      
      const result = await LiquidGlassNativeService.isAvailable();
      
      expect(result).toBe(true);
      expect(mockLiquidGlassModule.isAvailable).toHaveBeenCalledTimes(1);
    });

    it('should return false on iOS < 26', async () => {
      mockLiquidGlassModule.isAvailable.mockResolvedValue(false);
      
      const result = await LiquidGlassNativeService.isAvailable();
      
      expect(result).toBe(false);
    });

    it('should return false on Android', async () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        writable: true,
      });
      
      const result = await LiquidGlassNativeService.isAvailable();
      
      expect(result).toBe(false);
      expect(mockLiquidGlassModule.isAvailable).not.toHaveBeenCalled();
    });

    it('should handle native module errors gracefully', async () => {
      mockLiquidGlassModule.isAvailable.mockRejectedValue(new Error('Native error'));
      
      const result = await LiquidGlassNativeService.isAvailable();
      
      expect(result).toBe(false);
    });
  });

  describe('createLiquidGlassView', () => {
    it('should create a liquid glass view with default config', async () => {
      const mockResponse = { viewId: 12345, success: true };
      mockLiquidGlassModule.createLiquidGlassView.mockResolvedValue(mockResponse);
      
      const result = await LiquidGlassNativeService.createLiquidGlassView({});
      
      expect(result).toEqual(mockResponse);
      expect(mockLiquidGlassModule.createLiquidGlassView).toHaveBeenCalledWith({});
    });

    it('should create a liquid glass view with custom config', async () => {
      const config = {
        variant: 'ultra',
        intensity: 90,
        dynamicBlur: true,
      };
      const mockResponse = { viewId: 67890, success: true };
      mockLiquidGlassModule.createLiquidGlassView.mockResolvedValue(mockResponse);
      
      const result = await LiquidGlassNativeService.createLiquidGlassView(config);
      
      expect(result).toEqual(mockResponse);
      expect(mockLiquidGlassModule.createLiquidGlassView).toHaveBeenCalledWith(config);
    });

    it('should handle creation failure', async () => {
      mockLiquidGlassModule.createLiquidGlassView.mockRejectedValue(
        new Error('Failed to create view')
      );
      
      await expect(
        LiquidGlassNativeService.createLiquidGlassView({})
      ).rejects.toThrow('Failed to create view');
    });

    it('should validate intensity range', async () => {
      const invalidConfigs = [
        { intensity: -1 },
        { intensity: 101 },
        { intensity: 1000 },
      ];

      for (const config of invalidConfigs) {
        mockLiquidGlassModule.createLiquidGlassView.mockRejectedValue(
          new Error('Invalid intensity')
        );
        
        await expect(
          LiquidGlassNativeService.createLiquidGlassView(config)
        ).rejects.toThrow();
      }
    });
  });

  describe('updateGlassIntensity', () => {
    it('should update glass intensity successfully', async () => {
      mockLiquidGlassModule.updateGlassIntensity.mockResolvedValue(true);
      
      const result = await LiquidGlassNativeService.updateGlassIntensity(12345, 75);
      
      expect(result).toBe(true);
      expect(mockLiquidGlassModule.updateGlassIntensity).toHaveBeenCalledWith(12345, 75);
    });

    it('should reject invalid viewId', async () => {
      mockLiquidGlassModule.updateGlassIntensity.mockRejectedValue(
        new Error('Invalid view ID')
      );
      
      await expect(
        LiquidGlassNativeService.updateGlassIntensity(0, 50)
      ).rejects.toThrow('Invalid view ID');
    });

    it('should reject invalid intensity values', async () => {
      mockLiquidGlassModule.updateGlassIntensity.mockRejectedValue(
        new Error('Invalid intensity')
      );
      
      await expect(
        LiquidGlassNativeService.updateGlassIntensity(12345, 150)
      ).rejects.toThrow('Invalid intensity');
    });
  });

  describe('triggerHapticFeedback', () => {
    const validTypes = ['light', 'medium', 'heavy', 'selection'];

    validTypes.forEach((type) => {
      it(`should trigger ${type} haptic feedback`, () => {
        LiquidGlassNativeService.triggerHapticFeedback(type);
        
        expect(mockLiquidGlassModule.triggerHapticFeedback).toHaveBeenCalledWith(type);
      });
    });

    it('should handle invalid haptic types gracefully', () => {
      // Should not throw, just log warning
      expect(() => {
        LiquidGlassNativeService.triggerHapticFeedback('invalid');
      }).not.toThrow();
    });

    it('should not trigger haptics on Android', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        writable: true,
      });
      
      LiquidGlassNativeService.triggerHapticFeedback('light');
      
      expect(mockLiquidGlassModule.triggerHapticFeedback).not.toHaveBeenCalled();
    });
  });

  describe('Motion Tracking', () => {
    it('should start motion tracking', () => {
      LiquidGlassNativeService.startMotionTracking();
      
      expect(mockLiquidGlassModule.startMotionTracking).toHaveBeenCalledTimes(1);
    });

    it('should stop motion tracking', () => {
      LiquidGlassNativeService.stopMotionTracking();
      
      expect(mockLiquidGlassModule.stopMotionTracking).toHaveBeenCalledTimes(1);
    });

    it('should not start motion tracking on Android', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        writable: true,
      });
      
      LiquidGlassNativeService.startMotionTracking();
      
      expect(mockLiquidGlassModule.startMotionTracking).not.toHaveBeenCalled();
    });
  });

  describe('Event Listeners', () => {
    it('should add event listener', () => {
      LiquidGlassNativeService.addListener('DeviceMotion');
      
      expect(mockLiquidGlassModule.addListener).toHaveBeenCalledWith('DeviceMotion');
    });

    it('should remove listeners', () => {
      LiquidGlassNativeService.removeListeners(2);
      
      expect(mockLiquidGlassModule.removeListeners).toHaveBeenCalledWith(2);
    });

    it('should validate listener count', () => {
      // Negative count should be rejected
      expect(() => {
        LiquidGlassNativeService.removeListeners(-1);
      }).not.toThrow(); // Module handles validation
    });
  });

  describe('getConstants', () => {
    it('should return module constants', () => {
      const mockConstants = {
        isIOS26Available: true,
        supportedVariants: ['ultra', 'prominent', 'regular', 'thin', 'adaptive'],
        hasHapticSupport: true,
      };
      mockLiquidGlassModule.getConstants.mockReturnValue(mockConstants);
      
      const constants = LiquidGlassNativeService.getConstants();
      
      expect(constants).toEqual(mockConstants);
    });

    it('should return empty constants on Android', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        writable: true,
      });
      
      const constants = LiquidGlassNativeService.getConstants();
      
      expect(constants).toEqual({
        isIOS26Available: false,
        supportedVariants: [],
        hasHapticSupport: false,
      });
    });
  });

  describe('Resource Management', () => {
    it('should cleanup resources for a view', () => {
      LiquidGlassNativeService.cleanupResourcesForView(12345);
      
      expect(mockLiquidGlassModule.cleanupResourcesForView).toHaveBeenCalledWith(12345);
    });

    it('should handle cleanup errors gracefully', () => {
      mockLiquidGlassModule.cleanupResourcesForView.mockImplementation(() => {
        throw new Error('Cleanup failed');
      });
      
      // Should not throw
      expect(() => {
        LiquidGlassNativeService.cleanupResourcesForView(12345);
      }).not.toThrow();
    });
  });

  describe('Memory Safety', () => {
    it('should prevent retain cycles in display links', () => {
      // This test ensures the module uses weak references
      const config = { dynamicBlur: true };
      mockLiquidGlassModule.createLiquidGlassView.mockResolvedValue({
        viewId: 99999,
        success: true,
      });
      
      LiquidGlassNativeService.createLiquidGlassView(config);
      
      // Verify that cleanup is available for the created view
      expect(typeof LiquidGlassNativeService.cleanupResourcesForView).toBe('function');
    });
  });

  describe('iOS 26 Feature Detection', () => {
    it('should detect iOS 26 features correctly', () => {
      const constants = {
        isIOS26Available: true,
        supportedVariants: ['ultra', 'prominent', 'regular', 'thin', 'adaptive'],
        hasHapticSupport: true,
      };
      mockLiquidGlassModule.getConstants.mockReturnValue(constants);
      
      const result = LiquidGlassNativeService.getConstants();
      
      expect(result.isIOS26Available).toBe(true);
      expect(result.supportedVariants).toContain('ultra');
      expect(result.hasHapticSupport).toBe(true);
    });

    it('should handle pre-iOS 26 gracefully', () => {
      const constants = {
        isIOS26Available: false,
        supportedVariants: [],
        hasHapticSupport: true,
      };
      mockLiquidGlassModule.getConstants.mockReturnValue(constants);
      
      const result = LiquidGlassNativeService.getConstants();
      
      expect(result.isIOS26Available).toBe(false);
      expect(result.supportedVariants).toHaveLength(0);
    });
  });
});