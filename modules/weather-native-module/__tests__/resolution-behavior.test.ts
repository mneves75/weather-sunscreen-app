/**
 * Resolution behavior tests for WeatherNativeService
 * - Verifies TurboModule path when spec is present
 * - Verifies NativeModules fallback when spec is null
 * - Verifies web platform gating
 */

import path from 'path';

// Utilities to reload the service with fresh module state between scenarios
function reloadService() {
  jest.resetModules();
  // Re-require after reset
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const svc = require('../index');
  return svc.WeatherNativeService as typeof import('../index').WeatherNativeService;
}

describe('WeatherNativeService resolution behavior', () => {
  const serviceModulePath = path.join(__dirname, '..', 'index.ts');

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('uses TurboModule when spec is available', async () => {
    // Mock the Turbo spec import used by the service (mock by absolute path)
    const specAbs = path.resolve(process.cwd(), 'src/specs/WeatherNativeModuleSpec.ts');
    jest.doMock(specAbs, () => ({
      __esModule: true,
      default: {
        isAvailable: jest.fn(async () => true),
        getCurrentLocation: jest.fn(async () => ({ latitude: 1, longitude: 2, accuracy: 10 })),
        getUVIndexData: jest.fn(async () => ({ uvIndex: 5, maxUVToday: 7, peakTime: '12:00 PM' })),
        getWeatherData: jest.fn(async () => ({
          temperature: 22,
          description: 'Sunny',
          weatherCode: 0,
          humidity: 50,
          windSpeed: 3,
          pressure: 1013,
          visibility: 10,
          feelsLike: 22,
        })),
      },
    }));

    const WeatherNativeService = reloadService();
    // Ensure cache is clean
    WeatherNativeService._resetModuleCache();

    // Platform gate is only for web; simulate iOS
    const rn = require('react-native');
    const originalOS = rn.Platform.OS;
    rn.Platform.OS = 'ios';

    expect(await WeatherNativeService.isAvailable()).toBe(true);
    await expect(WeatherNativeService.getCurrentLocation()).resolves.toEqual(
      expect.objectContaining({ latitude: 1, longitude: 2 }),
    );
    await expect(WeatherNativeService.getUVIndexData(1, 2)).resolves.toEqual(
      expect.objectContaining({ uvIndex: 5 }),
    );
    await expect(WeatherNativeService.getWeatherData(1, 2)).resolves.toEqual(
      expect.objectContaining({ description: 'Sunny' }),
    );

    rn.Platform.OS = originalOS;
  });

  it('falls back to NativeModules when Turbo spec is null', async () => {
    // Make the Turbo spec resolve to null
    const specAbs = path.resolve(process.cwd(), 'src/specs/WeatherNativeModuleSpec.ts');
    jest.doMock(specAbs, () => ({
      __esModule: true,
      default: null,
    }));

    // Prepare NativeModules fallback
    const rn = require('react-native');
    rn.NativeModules.WeatherNativeModule = {
      isAvailable: jest.fn(async () => true),
      getCurrentLocation: jest.fn(async () => ({ latitude: 3, longitude: 4, accuracy: 5 })),
      getUVIndexData: jest.fn(async () => ({ uvIndex: 6, maxUVToday: 8, peakTime: '1:00 PM' })),
      getWeatherData: jest.fn(async () => ({
        temperature: 20,
        description: 'Partly Cloudy',
        weatherCode: 2,
        humidity: 60,
        windSpeed: 4,
        pressure: 1012,
        visibility: 9,
        feelsLike: 19,
      })),
    };

    const WeatherNativeService = reloadService();
    WeatherNativeService._resetModuleCache();

    const originalOS2 = rn.Platform.OS;
    rn.Platform.OS = 'ios';

    expect(await WeatherNativeService.isAvailable()).toBe(true);
    await expect(WeatherNativeService.getCurrentLocation()).resolves.toEqual(
      expect.objectContaining({ latitude: 3, longitude: 4 }),
    );
    await expect(WeatherNativeService.getUVIndexData(3, 4)).resolves.toEqual(
      expect.objectContaining({ uvIndex: 6 }),
    );
    await expect(WeatherNativeService.getWeatherData(3, 4)).resolves.toEqual(
      expect.objectContaining({ description: 'Partly Cloudy' }),
    );

    rn.Platform.OS = originalOS2;
  });

  it('returns unavailable on web regardless of native presence', async () => {
    const specAbs = path.resolve(process.cwd(), 'src/specs/WeatherNativeModuleSpec.ts');
    jest.doMock(specAbs, () => ({
      __esModule: true,
      default: {
        isAvailable: jest.fn(async () => true),
      },
    }));

    const WeatherNativeService = reloadService();
    WeatherNativeService._resetModuleCache();

    const rn = require('react-native');
    const originalOS3 = rn.Platform.OS;
    rn.Platform.OS = 'web';

    expect(await WeatherNativeService.isAvailable()).toBe(false);

    rn.Platform.OS = originalOS3;
  });
});
