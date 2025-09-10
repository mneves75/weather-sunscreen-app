// Simple test for LiquidGlassNative that verifies core functionality
describe('LiquidGlassNative - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should export LiquidGlassNative service', () => {
    const module = require('../index');
    expect(module.LiquidGlassNative).toBeDefined();
  });

  it('should export LiquidGlassConfig interface', () => {
    const module = require('../index');
    // TypeScript interfaces don't exist at runtime but the module should load
    expect(module).toBeDefined();
  });

  it('should have expected methods', () => {
    const module = require('../index');
    const service = module.LiquidGlassNative;

    expect(typeof service.isAvailable).toBe('function');
    expect(typeof service.getConstants).toBe('function');
    expect(typeof service.createLiquidGlassView).toBe('function');
    expect(typeof service.updateGlassIntensity).toBe('function');
    expect(typeof service.triggerHapticFeedback).toBe('function');
    expect(typeof service.startMotionTracking).toBe('function');
    expect(typeof service.stopMotionTracking).toBe('function');
    expect(typeof service.onDeviceMotion).toBe('function');
  });

  it('should handle missing native module gracefully', () => {
    // Mock NativeModules to be empty
    jest.doMock('react-native', () => ({
      NativeModules: {},
      NativeEventEmitter: jest.fn(() => ({
        addListener: jest.fn(),
        removeAllListeners: jest.fn(),
      })),
      Platform: {
        OS: 'ios',
        Version: '26.0',
      },
    }));

    const module = require('../index');
    const service = module.LiquidGlassNative;

    // Should return false when module is missing
    expect(service.isAvailable()).toBe(false);

    // Should return default constants
    const constants = service.getConstants();
    expect(constants.isIOS26Available).toBe(false);
    expect(constants.supportedVariants).toEqual([]);
    expect(constants.hasHapticSupport).toBe(false);
  });

  it('should throw error when creating view without iOS 26', async () => {
    jest.doMock('react-native', () => ({
      NativeModules: {
        LiquidGlassNativeModule: {
          createLiquidGlassView: jest.fn(),
        },
      },
      NativeEventEmitter: jest.fn(() => ({
        addListener: jest.fn(),
        removeAllListeners: jest.fn(),
      })),
      Platform: {
        OS: 'ios',
        Version: '15.0', // iOS < 26
      },
    }));

    const module = require('../index');
    const service = module.LiquidGlassNative;

    await expect(service.createLiquidGlassView({ variant: 'regular' })).rejects.toThrow(
      'Liquid Glass is only available on iOS 26+',
    );
  });
});
