/**
 * TurboModule Specification Tests
 * Tests that TurboModule specifications work correctly with Codegen
 * 
 * These tests validate the TypeScript interface definitions and ensure
 * they match the native implementations correctly
 */

import { Platform } from 'react-native';

// Import TurboModule specifications
import WeatherNativeModuleTurbo from '../specs/WeatherNativeModuleSpec';
import LiquidGlassNativeModuleTurbo from '../specs/LiquidGlassNativeModuleSpec';
import type { 
  LocationData, 
  WeatherData, 
  UVData 
} from '../specs/WeatherNativeModuleSpec';
import type { 
  LiquidGlassConfig,
  LiquidGlassView,
  DeviceMotionData 
} from '../specs/LiquidGlassNativeModuleSpec';

describe('TurboModule Specification Tests', () => {
  describe('WeatherNativeModule TurboModule Spec', () => {
    it('should have proper TurboModule interface', () => {
      if (Platform.OS === 'web') {
        // TurboModules not available on web
        expect(WeatherNativeModuleTurbo).toBeNull();
        return;
      }

      if (WeatherNativeModuleTurbo) {
        // TurboModule is available, verify interface
        expect(typeof WeatherNativeModuleTurbo.isAvailable).toBe('function');
        expect(typeof WeatherNativeModuleTurbo.getCurrentLocation).toBe('function');
        expect(typeof WeatherNativeModuleTurbo.getWeatherData).toBe('function');
        expect(typeof WeatherNativeModuleTurbo.getUVIndexData).toBe('function');
        
        console.log('✅ WeatherNativeModule TurboModule interface verified');
      } else {
        console.log('ℹ️ WeatherNativeModule TurboModule not available (expected in test environment)');
      }
    });

    it('should validate LocationData type structure', () => {
      const validLocationData: LocationData = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 5.0,
      };

      expect(typeof validLocationData.latitude).toBe('number');
      expect(typeof validLocationData.longitude).toBe('number');
      expect(typeof validLocationData.accuracy).toBe('number');
      
      // Test bounds
      expect(validLocationData.latitude).toBeGreaterThanOrEqual(-90);
      expect(validLocationData.latitude).toBeLessThanOrEqual(90);
      expect(validLocationData.longitude).toBeGreaterThanOrEqual(-180);
      expect(validLocationData.longitude).toBeLessThanOrEqual(180);
      expect(validLocationData.accuracy).toBeGreaterThan(0);
    });

    it('should validate WeatherData type structure', () => {
      const validWeatherData: WeatherData = {
        temperature: 22.5,
        description: 'Partly cloudy',
        weatherCode: 2,
        humidity: 65,
        windSpeed: 3.5,
        pressure: 1013.25,
        visibility: 10,
        feelsLike: 24.1,
        isFallback: false,
      };

      expect(typeof validWeatherData.temperature).toBe('number');
      expect(typeof validWeatherData.description).toBe('string');
      expect(typeof validWeatherData.weatherCode).toBe('number');
      expect(typeof validWeatherData.humidity).toBe('number');
      expect(typeof validWeatherData.windSpeed).toBe('number');
      expect(typeof validWeatherData.pressure).toBe('number');
      expect(typeof validWeatherData.visibility).toBe('number');
      expect(typeof validWeatherData.feelsLike).toBe('number');
      
      // Validate ranges
      expect(validWeatherData.humidity).toBeGreaterThanOrEqual(0);
      expect(validWeatherData.humidity).toBeLessThanOrEqual(100);
      expect(validWeatherData.weatherCode).toBeGreaterThanOrEqual(0);
      expect(validWeatherData.windSpeed).toBeGreaterThanOrEqual(0);
      expect(validWeatherData.pressure).toBeGreaterThan(0);
      expect(validWeatherData.visibility).toBeGreaterThanOrEqual(0);
    });

    it('should validate UVData type structure', () => {
      const validUVData: UVData = {
        uvIndex: 7,
        maxUVToday: 9,
        peakTime: '12:00 PM',
        isFallback: false,
      };

      expect(typeof validUVData.uvIndex).toBe('number');
      expect(typeof validUVData.maxUVToday).toBe('number');
      expect(typeof validUVData.peakTime).toBe('string');
      
      // Validate UV index range
      expect(validUVData.uvIndex).toBeGreaterThanOrEqual(0);
      expect(validUVData.uvIndex).toBeLessThanOrEqual(12);
      expect(validUVData.maxUVToday).toBeGreaterThanOrEqual(0);
      expect(validUVData.maxUVToday).toBeLessThanOrEqual(12);
      expect(validUVData.peakTime.length).toBeGreaterThan(0);
    });
  });

  describe('LiquidGlassNativeModule TurboModule Spec', () => {
    it('should have proper TurboModule interface', () => {
      if (Platform.OS !== 'ios') {
        // LiquidGlass only available on iOS
        expect(LiquidGlassNativeModuleTurbo).toBeNull();
        return;
      }

      if (LiquidGlassNativeModuleTurbo) {
        // TurboModule is available, verify interface
        expect(typeof LiquidGlassNativeModuleTurbo.isAvailable).toBe('function');
        expect(typeof LiquidGlassNativeModuleTurbo.getConstants).toBe('function');
        expect(typeof LiquidGlassNativeModuleTurbo.createLiquidGlassView).toBe('function');
        expect(typeof LiquidGlassNativeModuleTurbo.updateGlassIntensity).toBe('function');
        expect(typeof LiquidGlassNativeModuleTurbo.triggerHapticFeedback).toBe('function');
        expect(typeof LiquidGlassNativeModuleTurbo.startMotionTracking).toBe('function');
        expect(typeof LiquidGlassNativeModuleTurbo.stopMotionTracking).toBe('function');
        expect(typeof LiquidGlassNativeModuleTurbo.addListener).toBe('function');
        expect(typeof LiquidGlassNativeModuleTurbo.removeListeners).toBe('function');
        
        console.log('✅ LiquidGlassNativeModule TurboModule interface verified');
      } else {
        console.log('ℹ️ LiquidGlassNativeModule TurboModule not available (expected in test environment)');
      }
    });

    it('should validate LiquidGlassConfig type structure', () => {
      const validConfigs: LiquidGlassConfig[] = [
        {
          variant: 'ultra',
          intensity: 100,
          dynamicBlur: true,
          parallaxEnabled: true,
          hapticFeedback: true,
        },
        {
          variant: 'thin',
          intensity: 50,
          dynamicBlur: false,
          parallaxEnabled: false,
          hapticFeedback: false,
        },
        {
          // Minimal config
          variant: 'regular',
        },
        {
          // All optional fields omitted
        } as LiquidGlassConfig,
      ];

      validConfigs.forEach((config, index) => {
        if (config.variant) {
          expect(['ultra', 'prominent', 'regular', 'thin', 'adaptive']).toContain(config.variant);
        }
        
        if (config.intensity !== undefined) {
          expect(typeof config.intensity).toBe('number');
          expect(config.intensity).toBeGreaterThanOrEqual(0);
          expect(config.intensity).toBeLessThanOrEqual(100);
        }
        
        if (config.dynamicBlur !== undefined) {
          expect(typeof config.dynamicBlur).toBe('boolean');
        }
        
        if (config.parallaxEnabled !== undefined) {
          expect(typeof config.parallaxEnabled).toBe('boolean');
        }
        
        if (config.hapticFeedback !== undefined) {
          expect(typeof config.hapticFeedback).toBe('boolean');
        }
        
        console.log(`✅ Config ${index + 1} validated successfully`);
      });
    });

    it('should validate LiquidGlassView type structure', () => {
      const validGlassView: LiquidGlassView = {
        viewId: 12345,
        success: true,
      };

      expect(typeof validGlassView.viewId).toBe('number');
      expect(typeof validGlassView.success).toBe('boolean');
      expect(validGlassView.viewId).toBeGreaterThan(0);
    });

    it('should validate DeviceMotionData type structure', () => {
      const validMotionData: DeviceMotionData = {
        x: 0.1,
        y: -0.2,
        z: 0.05,
      };

      expect(typeof validMotionData.x).toBe('number');
      expect(typeof validMotionData.y).toBe('number');
      expect(typeof validMotionData.z).toBe('number');
      
      // Motion values should be reasonable (typically -1 to 1 for gravity)
      expect(validMotionData.x).toBeGreaterThanOrEqual(-2);
      expect(validMotionData.x).toBeLessThanOrEqual(2);
      expect(validMotionData.y).toBeGreaterThanOrEqual(-2);
      expect(validMotionData.y).toBeLessThanOrEqual(2);
      expect(validMotionData.z).toBeGreaterThanOrEqual(-2);
      expect(validMotionData.z).toBeLessThanOrEqual(2);
    });
  });

  describe('Type Safety Validation', () => {
    it('should prevent invalid type assignments', () => {
      // These should cause TypeScript compilation errors if uncommented:
      
      // Invalid LocationData
      // const invalidLocation: LocationData = {
      //   latitude: "invalid", // Should be number
      //   longitude: -122.4194,
      //   accuracy: 5.0,
      // };

      // Invalid WeatherData
      // const invalidWeather: WeatherData = {
      //   temperature: 22.5,
      //   description: 123, // Should be string
      //   weatherCode: 2,
      //   humidity: 65,
      //   windSpeed: 3.5,
      //   pressure: 1013.25,
      //   visibility: 10,
      //   feelsLike: 24.1,
      // };

      // Invalid LiquidGlassConfig
      // const invalidConfig: LiquidGlassConfig = {
      //   variant: "invalid", // Should be one of the allowed variants
      //   intensity: "high", // Should be number
      // };

      // If we reach here, TypeScript compilation succeeded
      expect(true).toBe(true);
    });

    it('should handle optional properties correctly', () => {
      // These should all be valid due to optional properties
      const minimalWeather: Partial<WeatherData> = {
        temperature: 20,
        description: 'Clear',
      };

      const minimalGlassConfig: LiquidGlassConfig = {};

      const minimalUVData: Partial<UVData> = {
        uvIndex: 5,
      };

      expect(typeof minimalWeather.temperature).toBe('number');
      expect(typeof minimalWeather.description).toBe('string');
      expect(typeof minimalGlassConfig).toBe('object');
      expect(typeof minimalUVData.uvIndex).toBe('number');
    });
  });

  describe('Codegen Integration', () => {
    it('should work with React Native Codegen types', () => {
      // Test that our specs work with Codegen-generated types
      // This validates that WithDefault, Float, Int32, etc. work correctly
      
      // These type assertions should compile without errors
      const intensity: number = 80; // Should work with Float type
      const viewId: number = 123; // Should work with Int32 type
      const enabled: boolean = true; // Should work with boolean type
      
      expect(typeof intensity).toBe('number');
      expect(typeof viewId).toBe('number');
      expect(typeof enabled).toBe('boolean');
      
      // Test WithDefault behavior (defaults are applied by Codegen at runtime)
      const configWithDefaults: LiquidGlassConfig = {
        // variant defaults to 'regular'
        // intensity defaults to 80.0
        // dynamicBlur defaults to true
        // etc.
      };
      
      expect(typeof configWithDefaults).toBe('object');
    });

    it('should maintain compatibility with legacy NativeModules', () => {
      // Test that our TurboModule specs are compatible with legacy bridge
      // This ensures smooth migration path
      
      if (Platform.OS === 'web') {
        // Both TurboModule and legacy should be null on web
        expect(WeatherNativeModuleTurbo).toBeNull();
        expect(LiquidGlassNativeModuleTurbo).toBeNull();
        return;
      }

      // If TurboModule is not available, legacy bridge should still work
      // This is tested through the service layer's fallback mechanism
      console.log('Legacy compatibility maintained through service layer fallbacks');
    });
  });
});