import { LiquidGlassNative } from '../index';

// Simple test for LiquidGlassNative that verifies core functionality
describe('LiquidGlassNative - Simple Tests', () => {
  beforeEach(() => {
    // Reset any cached module state
    if ((LiquidGlassNative as any)._resetModuleCache) {
      (LiquidGlassNative as any)._resetModuleCache();
    }
  });

  it('should export LiquidGlassNative service', () => {
    expect(LiquidGlassNative).toBeDefined();
    expect(typeof LiquidGlassNative).toBe('object');
  });

  it('should have basic availability check', () => {
    // Should be able to call isAvailable without errors
    const available = LiquidGlassNative.isAvailable();
    expect(typeof available).toBe('boolean');
    
    // In test environment with mocked React Native, should be false
    expect(available).toBe(false);
  });

  it('should have all expected methods', () => {
    expect(typeof LiquidGlassNative.isAvailable).toBe('function');
    expect(typeof LiquidGlassNative.getConstants).toBe('function');
    expect(typeof LiquidGlassNative.createLiquidGlassView).toBe('function');
    expect(typeof LiquidGlassNative.updateGlassIntensity).toBe('function');
    expect(typeof LiquidGlassNative.triggerHapticFeedback).toBe('function');
    expect(typeof LiquidGlassNative.startMotionTracking).toBe('function');
    expect(typeof LiquidGlassNative.stopMotionTracking).toBe('function');
    expect(typeof LiquidGlassNative.onDeviceMotion).toBe('function');
  });

  it('should handle module unavailability gracefully', () => {
    // When module is not available, should return false
    const available = LiquidGlassNative.isAvailable();
    expect(available).toBe(false);

    // Should return default constants
    const constants = LiquidGlassNative.getConstants();
    expect(constants).toBeDefined();
    expect(constants.isIOS26Available).toBe(false);
    expect(constants.supportedVariants).toEqual([]);
    expect(constants.hasHapticSupport).toBe(false);
  });

  it('should handle create view when module unavailable', async () => {
    // Should throw error when trying to create view without module
    await expect(
      LiquidGlassNative.createLiquidGlassView({ variant: 'regular' })
    ).rejects.toThrow();
  });
});
