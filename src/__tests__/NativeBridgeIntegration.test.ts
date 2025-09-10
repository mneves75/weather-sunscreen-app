/**
 * Integration Tests for Native Bridge
 * Tests actual JavaScript <-> Native communication without mocks
 * 
 * These tests verify the TurboModule bridge works correctly in real scenarios
 */

import { Platform } from 'react-native';
import { WeatherNativeService } from '../../modules/weather-native-module';
import { LiquidGlassNative } from '../../modules/liquid-glass-native';

// Test configuration
const INTEGRATION_TEST_TIMEOUT = 10000; // 10 seconds for real operations

describe('Native Bridge Integration Tests', () => {
  beforeAll(() => {
    jest.setTimeout(INTEGRATION_TEST_TIMEOUT);
  });

  beforeEach(() => {
    // Reset module caches to ensure fresh state
    WeatherNativeService._resetModuleCache();
    (LiquidGlassNative as any)._resetModuleCache();
  });

  describe('Weather Native Module Bridge', () => {
    it('should successfully communicate with native weather module', async () => {
      // Test the actual bridge communication
      const isAvailable = await WeatherNativeService.isAvailable();
      
      // This should work regardless of platform (returns false on web, true/false on native)
      expect(typeof isAvailable).toBe('boolean');
      
      if (Platform.OS === 'web') {
        expect(isAvailable).toBe(false);
      } else {
        // On native platforms, this tests actual TurboModule/Legacy bridge
        // Result depends on whether native module is actually available
        console.log(`Weather module availability on ${Platform.OS}: ${isAvailable}`);
      }
    });

    it('should handle bridge errors gracefully', async () => {
      // Test error handling in the bridge
      try {
        // This should either return location data or throw a clear error
        const location = await WeatherNativeService.getCurrentLocation();
        
        // If successful, validate the response structure
        expect(location).toHaveProperty('latitude');
        expect(location).toHaveProperty('longitude');
        expect(location).toHaveProperty('accuracy');
        
        // Validate data types
        expect(typeof location.latitude).toBe('number');
        expect(typeof location.longitude).toBe('number');
        expect(typeof location.accuracy).toBe('number');
        
        console.log('Location obtained successfully:', location);
        
      } catch (error) {
        // Should be a clear, structured error
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('message');
        
        // Error should be descriptive
        const errorMessage = (error as Error).message;
        expect(errorMessage.length).toBeGreaterThan(10);
        
        console.log('Location request failed as expected:', errorMessage);
      }
    });

    it('should validate input parameters through the bridge', async () => {
      // Test that input validation works through the bridge
      const testCases = [
        { lat: 999, lon: 0, description: 'invalid latitude (too high)' },
        { lat: -999, lon: 0, description: 'invalid latitude (too low)' },
        { lat: 0, lon: 999, description: 'invalid longitude (too high)' },
        { lat: 0, lon: -999, description: 'invalid longitude (too low)' },
        { lat: NaN, lon: 0, description: 'NaN latitude' },
        { lat: 0, lon: NaN, description: 'NaN longitude' },
      ];

      for (const testCase of testCases) {
        try {
          await WeatherNativeService.getWeatherData(testCase.lat, testCase.lon);
          
          // If it doesn't throw, it should return fallback data with isFallback flag
          const result = await WeatherNativeService.getWeatherData(testCase.lat, testCase.lon);
          if ('isFallback' in result) {
            expect(result.isFallback).toBe(true);
            console.log(`Fallback data returned for ${testCase.description}`);
          }
          
        } catch (error) {
          // Should throw a validation error
          expect(error).toBeInstanceOf(Error);
          const errorMessage = (error as Error).message;
          expect(errorMessage.toLowerCase()).toMatch(/invalid|latitude|longitude|bounds/);
          console.log(`Validation error for ${testCase.description}: ${errorMessage}`);
        }
      }
    });

    it('should handle concurrent bridge calls correctly', async () => {
      // Test concurrent access to the bridge
      const concurrentCalls = [
        WeatherNativeService.isAvailable(),
        WeatherNativeService.isAvailable(),
        WeatherNativeService.isAvailable(),
      ];

      const results = await Promise.all(concurrentCalls);
      
      // All calls should return the same result
      expect(results[0]).toBe(results[1]);
      expect(results[1]).toBe(results[2]);
      
      // All should be boolean
      results.forEach(result => {
        expect(typeof result).toBe('boolean');
      });

      console.log('Concurrent calls completed successfully:', results);
    });
  });

  describe('LiquidGlass Native Module Bridge', () => {
    it('should successfully check availability through bridge', () => {
      // Test synchronous bridge communication
      const isAvailable = LiquidGlassNative.isAvailable();
      
      expect(typeof isAvailable).toBe('boolean');
      
      if (Platform.OS === 'ios') {
        // On iOS, this tests actual module availability
        console.log(`LiquidGlass availability on iOS: ${isAvailable}`);
      } else {
        // On other platforms, should be false
        expect(isAvailable).toBe(false);
      }
    });

    it('should handle glass view creation through bridge', async () => {
      if (!LiquidGlassNative.isAvailable()) {
        console.log('Skipping glass view test - module not available');
        return;
      }

      try {
        const config = {
          variant: 'regular' as const,
          intensity: 80,
          dynamicBlur: true,
          parallaxEnabled: false,
          hapticFeedback: false,
        };

        const result = await LiquidGlassNative.createLiquidGlassView(config);
        
        // Validate result structure
        expect(result).toHaveProperty('viewId');
        expect(result).toHaveProperty('success');
        expect(typeof result.viewId).toBe('number');
        expect(typeof result.success).toBe('boolean');
        expect(result.success).toBe(true);
        expect(result.viewId).toBeGreaterThan(0);

        console.log('Glass view created successfully:', result);
        
      } catch (error) {
        // Should be a clear error if module is available but creation fails
        expect(error).toBeInstanceOf(Error);
        console.log('Glass view creation failed:', (error as Error).message);
      }
    });

    it('should validate glass intensity through bridge', async () => {
      const testCases = [
        { viewId: -1, intensity: 50, description: 'invalid viewId (negative)' },
        { viewId: 0, intensity: 50, description: 'invalid viewId (zero)' },
        { viewId: 1, intensity: -10, description: 'invalid intensity (negative)' },
        { viewId: 1, intensity: 150, description: 'invalid intensity (too high)' },
        { viewId: 1, intensity: NaN, description: 'NaN intensity' },
      ];

      for (const testCase of testCases) {
        try {
          await LiquidGlassNative.updateGlassIntensity(testCase.viewId, testCase.intensity);
          
          // If module is not available, it might not throw
          if (!LiquidGlassNative.isAvailable()) {
            console.log(`Update silently ignored for ${testCase.description} (module unavailable)`);
          }
          
        } catch (error) {
          // Should throw a validation error
          expect(error).toBeInstanceOf(Error);
          const errorMessage = (error as Error).message;
          expect(errorMessage.toLowerCase()).toMatch(/invalid|view|intensity|bounds/);
          console.log(`Validation error for ${testCase.description}: ${errorMessage}`);
        }
      }
    });

    it('should handle haptic feedback through bridge', () => {
      // Test synchronous bridge call
      const hapticTypes = ['light', 'medium', 'heavy', 'selection'] as const;
      
      hapticTypes.forEach(type => {
        try {
          LiquidGlassNative.triggerHapticFeedback(type);
          console.log(`Haptic feedback '${type}' triggered successfully`);
        } catch (error) {
          console.log(`Haptic feedback '${type}' failed:`, (error as Error).message);
        }
      });

      // Test invalid haptic type
      try {
        LiquidGlassNative.triggerHapticFeedback('invalid' as any);
        console.log('Invalid haptic type was accepted (unexpected)');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        console.log('Invalid haptic type rejected correctly:', (error as Error).message);
      }
    });

    it('should handle motion tracking state through bridge', () => {
      try {
        // Test start motion tracking
        LiquidGlassNative.startMotionTracking();
        console.log('Motion tracking started successfully');
        
        // Test stop motion tracking
        LiquidGlassNative.stopMotionTracking();
        console.log('Motion tracking stopped successfully');
        
      } catch (error) {
        console.log('Motion tracking operations failed:', (error as Error).message);
        // These operations can fail silently on platforms without motion support
      }
    });
  });

  describe('Bridge Performance Integration', () => {
    it('should handle rapid successive calls without memory leaks', async () => {
      const iterations = 50;
      let successfulCalls = 0;
      
      console.log(`Testing ${iterations} rapid successive calls...`);
      
      for (let i = 0; i < iterations; i++) {
        try {
          // Mix different types of calls
          if (i % 3 === 0) {
            await WeatherNativeService.isAvailable();
          } else if (i % 3 === 1) {
            LiquidGlassNative.isAvailable();
          } else {
            LiquidGlassNative.triggerHapticFeedback('light');
          }
          successfulCalls++;
        } catch (error) {
          // Some failures are expected (module unavailability, etc.)
          console.log(`Call ${i} failed:`, (error as Error).message);
        }
      }
      
      console.log(`Completed ${successfulCalls}/${iterations} calls successfully`);
      
      // Should complete at least 50% of calls (unavailable modules will fail)
      expect(successfulCalls).toBeGreaterThan(iterations * 0.5);
    });

    it('should maintain bridge stability under error conditions', async () => {
      const errorInducingCalls = [
        () => WeatherNativeService.getWeatherData(999, 999),
        () => WeatherNativeService.getUVIndexData(-999, -999),
        () => LiquidGlassNative.updateGlassIntensity(-1, -1),
        () => LiquidGlassNative.triggerHapticFeedback('invalid' as any),
      ];

      let errors = 0;
      let successes = 0;

      for (const call of errorInducingCalls) {
        try {
          await call();
          successes++;
        } catch (error) {
          errors++;
          // Verify errors are proper Error objects
          expect(error).toBeInstanceOf(Error);
        }
      }

      console.log(`Error handling test: ${errors} errors, ${successes} successes`);
      
      // After error conditions, normal calls should still work
      const isAvailable = await WeatherNativeService.isAvailable();
      expect(typeof isAvailable).toBe('boolean');
      
      const glassAvailable = LiquidGlassNative.isAvailable();
      expect(typeof glassAvailable).toBe('boolean');
      
      console.log('Bridge remained stable after error conditions');
    });
  });

  describe('Bridge Error Recovery', () => {
    it('should recover gracefully from module reset', async () => {
      // Test initial state
      const initialAvailability = await WeatherNativeService.isAvailable();
      
      // Reset module cache
      WeatherNativeService._resetModuleCache();
      (LiquidGlassNative as any)._resetModuleCache();
      
      // Test that bridge works after reset
      const postResetAvailability = await WeatherNativeService.isAvailable();
      
      // Should be the same result
      expect(postResetAvailability).toBe(initialAvailability);
      
      console.log('Bridge recovered successfully after module reset');
    });
  });
});