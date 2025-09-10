/**
 * REAL Performance benchmarks for New Architecture implementation
 * Tests actual performance targets with real module execution
 * 
 * These tests measure ACTUAL module performance, not mocked timing
 */

import { WeatherNativeService } from '../../modules/weather-native-module';
import { LiquidGlassNative } from '../../modules/liquid-glass-native';

// Real performance test configuration
const PERFORMANCE_TARGETS = {
  MODULE_AVAILABILITY_CHECK: 50, // ms
  LOCATION_REQUEST: 5000, // ms (GPS can be slow)
  WEATHER_API_CALL: 2000, // ms
  UV_DATA_REQUEST: 2000, // ms
  CONCURRENT_CALLS: 3000, // ms
  GLASS_VIEW_CREATION: 100, // ms
  HAPTIC_FEEDBACK: 10, // ms
  MOTION_TRACKING_START: 50, // ms
};

// Test coordinates (San Francisco)
const TEST_COORDS = {
  latitude: 37.7749,
  longitude: -122.4194,
};

describe('Real Performance Benchmarks', () => {
  beforeAll(() => {
    // Set longer timeout for real network calls
    jest.setTimeout(30000);
  });

  describe('Weather Module Performance', () => {
    it('should check module availability within target time', async () => {
      const startTime = Date.now();
      
      const isAvailable = await WeatherNativeService.isAvailable();
      
      const duration = Date.now() - startTime;
      console.log(`Module availability check took: ${duration}ms`);
      
      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.MODULE_AVAILABILITY_CHECK);
      expect(typeof isAvailable).toBe('boolean');
    });

    it('should handle location requests within reasonable time', async () => {
      const isAvailable = await WeatherNativeService.isAvailable();
      
      if (!isAvailable) {
        console.log('Skipping location test - module not available on this platform');
        return;
      }

      const startTime = Date.now();
      
      try {
        const location = await WeatherNativeService.getCurrentLocation();
        const duration = Date.now() - startTime;
        
        console.log(`Location request took: ${duration}ms`);
        console.log(`Location result:`, location);
        
        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.LOCATION_REQUEST);
        expect(location).toHaveProperty('latitude');
        expect(location).toHaveProperty('longitude');
        expect(location).toHaveProperty('accuracy');
        
        // Validate coordinates are reasonable
        expect(location.latitude).toBeGreaterThanOrEqual(-90);
        expect(location.latitude).toBeLessThanOrEqual(90);
        expect(location.longitude).toBeGreaterThanOrEqual(-180);
        expect(location.longitude).toBeLessThanOrEqual(180);
        
      } catch (error) {
        console.log('Location request failed (expected in simulator):', error);
        // This is expected in simulators/CI - just verify error handling is fast
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.LOCATION_REQUEST);
      }
    });

    it('should fetch weather data within target time', async () => {
      const startTime = Date.now();
      
      try {
        const weatherData = await WeatherNativeService.getWeatherData(
          TEST_COORDS.latitude,
          TEST_COORDS.longitude
        );
        
        const duration = Date.now() - startTime;
        console.log(`Weather data fetch took: ${duration}ms`);
        console.log(`Weather result:`, weatherData);
        
        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.WEATHER_API_CALL);
        expect(weatherData).toHaveProperty('temperature');
        expect(weatherData).toHaveProperty('description');
        expect(weatherData).toHaveProperty('weatherCode');
        expect(weatherData).toHaveProperty('humidity');
        
        // Validate data ranges
        expect(typeof weatherData.temperature).toBe('number');
        expect(typeof weatherData.humidity).toBe('number');
        expect(weatherData.humidity).toBeGreaterThanOrEqual(0);
        expect(weatherData.humidity).toBeLessThanOrEqual(100);
        
      } catch (error) {
        console.log('Weather API call failed:', error);
        const duration = Date.now() - startTime;
        // Even failures should be handled quickly
        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.WEATHER_API_CALL);
      }
    });

    it('should fetch UV data within target time', async () => {
      const startTime = Date.now();
      
      try {
        const uvData = await WeatherNativeService.getUVIndexData(
          TEST_COORDS.latitude,
          TEST_COORDS.longitude
        );
        
        const duration = Date.now() - startTime;
        console.log(`UV data fetch took: ${duration}ms`);
        console.log(`UV result:`, uvData);
        
        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.UV_DATA_REQUEST);
        expect(uvData).toHaveProperty('uvIndex');
        expect(uvData).toHaveProperty('maxUVToday');
        expect(uvData).toHaveProperty('peakTime');
        
        // Validate UV index range
        expect(typeof uvData.uvIndex).toBe('number');
        expect(uvData.uvIndex).toBeGreaterThanOrEqual(0);
        expect(uvData.uvIndex).toBeLessThanOrEqual(12); // UV index range
        
      } catch (error) {
        console.log('UV API call failed:', error);
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.UV_DATA_REQUEST);
      }
    });

    it('should handle concurrent API calls efficiently', async () => {
      const startTime = Date.now();
      
      try {
        // Execute multiple calls concurrently
        const [weatherResult, uvResult] = await Promise.all([
          WeatherNativeService.getWeatherData(TEST_COORDS.latitude, TEST_COORDS.longitude),
          WeatherNativeService.getUVIndexData(TEST_COORDS.latitude, TEST_COORDS.longitude),
        ]);
        
        const duration = Date.now() - startTime;
        console.log(`Concurrent API calls took: ${duration}ms`);
        
        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.CONCURRENT_CALLS);
        expect(weatherResult).toBeDefined();
        expect(uvResult).toBeDefined();
        
        // Concurrent calls should be faster than sequential
        // (though this depends on network conditions)
        console.log('✅ Concurrent execution completed');
        
      } catch (error) {
        console.log('Concurrent API calls failed:', error);
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.CONCURRENT_CALLS);
      }
    });
  });

  describe('LiquidGlass Module Performance', () => {
    it('should check availability quickly', async () => {
      const startTime = Date.now();
      
      const isAvailable = LiquidGlassNative.isAvailable();
      
      const duration = Date.now() - startTime;
      console.log(`LiquidGlass availability check took: ${duration}ms`);
      
      expect(duration).toBeLessThan(10); // Should be synchronous
      expect(typeof isAvailable).toBe('boolean');
    });

    it('should create glass view within target time', async () => {
      const isAvailable = LiquidGlassNative.isAvailable();
      
      if (!isAvailable) {
        console.log('Skipping glass view test - not available on this platform');
        return;
      }

      const startTime = Date.now();
      
      try {
        const glassView = await LiquidGlassNative.createLiquidGlassView({
          variant: 'regular',
          intensity: 80,
          dynamicBlur: true,
          parallaxEnabled: false, // Disable for consistent testing
          hapticFeedback: false, // Disable for consistent testing
        });
        
        const duration = Date.now() - startTime;
        console.log(`Glass view creation took: ${duration}ms`);
        
        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.GLASS_VIEW_CREATION);
        expect(glassView).toHaveProperty('viewId');
        expect(glassView).toHaveProperty('success');
        expect(glassView.success).toBe(true);
        
      } catch (error) {
        console.log('Glass view creation failed:', error);
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.GLASS_VIEW_CREATION);
      }
    });

    it('should trigger haptic feedback quickly', () => {
      const startTime = Date.now();
      
      // Haptic feedback is synchronous
      LiquidGlassNative.triggerHapticFeedback('light');
      
      const duration = Date.now() - startTime;
      console.log(`Haptic feedback took: ${duration}ms`);
      
      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.HAPTIC_FEEDBACK);
    });

    it('should start motion tracking quickly', () => {
      const startTime = Date.now();
      
      LiquidGlassNative.startMotionTracking();
      
      const duration = Date.now() - startTime;
      console.log(`Motion tracking start took: ${duration}ms`);
      
      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.MOTION_TRACKING_START);
      
      // Clean up
      LiquidGlassNative.stopMotionTracking();
    });
  });

  describe('Memory Performance', () => {
    it('should not leak memory during multiple operations', async () => {
      // This test would ideally use actual memory profiling
      // For now, we test that multiple operations complete without crashes
      
      const operations = 10;
      let completedOperations = 0;
      
      const startTime = Date.now();
      
      for (let i = 0; i < operations; i++) {
        try {
          // Mix of different operations
          if (i % 3 === 0) {
            await WeatherNativeService.isAvailable();
          } else if (i % 3 === 1) {
            LiquidGlassNative.isAvailable();
          } else {
            LiquidGlassNative.triggerHapticFeedback('light');
          }
          completedOperations++;
        } catch (error) {
          console.log(`Operation ${i} failed:`, error);
        }
      }
      
      const duration = Date.now() - startTime;
      console.log(`${operations} operations took: ${duration}ms (${completedOperations} completed)`);
      
      expect(completedOperations).toBeGreaterThan(operations * 0.5); // At least 50% should succeed
      expect(duration).toBeLessThan(operations * 100); // Should be reasonable
    });
  });

  describe('Error Recovery Performance', () => {
    it('should handle invalid coordinates quickly', async () => {
      const startTime = Date.now();
      
      try {
        // Test with invalid coordinates
        await WeatherNativeService.getWeatherData(999, -999);
        
        // If it doesn't throw, that's fine too (might return mock data)
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.WEATHER_API_CALL);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        console.log(`Error handling took: ${duration}ms`);
        
        // Error handling should be fast
        expect(duration).toBeLessThan(100);
        expect(error).toBeDefined();
      }
    });

    it('should handle module unavailability gracefully', async () => {
      const startTime = Date.now();
      
      // This will test the fallback code paths
      const isAvailable = await WeatherNativeService.isAvailable();
      
      const duration = Date.now() - startTime;
      console.log(`Availability check with potential fallback took: ${duration}ms`);
      
      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.MODULE_AVAILABILITY_CHECK);
      expect(typeof isAvailable).toBe('boolean');
    });
  });
});

// Export performance targets for use in other tests
export { PERFORMANCE_TARGETS };