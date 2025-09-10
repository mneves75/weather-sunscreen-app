// Mock expo-localization to satisfy i18n import chain
jest.mock('expo-localization', () => ({
  locale: 'en-US',
  locales: ['en-US'],
  timezone: 'America/New_York',
  isRTL: false,
  region: 'US',
}));

// Mock native module service as unavailable to trigger fallbacks
jest.mock('../../../modules/weather-native-module', () => ({
  __esModule: true,
  WeatherNativeService: {
    isAvailable: jest.fn().mockResolvedValue(false),
    getUVIndexData: jest.fn(),
    getWeatherData: jest.fn(),
  },
}));

// Mock LocationService
jest.mock('../locationService', () => ({
  LocationService: {
    getCurrentLocation: jest.fn().mockResolvedValue({ latitude: 40.7128, longitude: -74.006 }),
    getDetailedLocationInfo: jest.fn().mockResolvedValue({ name: 'New York', country: 'US' }),
  },
}));

// Mock OpenMeteoService
jest.mock('../openMeteoService', () => ({
  OpenMeteoService: {
    getDailyForecast: jest.fn().mockResolvedValue([
      {
        date: '2025-01-01',
        weatherCode: 0,
        maxTemp: 20,
        minTemp: 10,
        uvIndex: 7,
        precipitation: 0,
        precipitationProbability: 10,
      },
    ]),
  },
}));

import { WeatherService } from '../weatherService';
import { LocationService } from '../locationService';
import { OpenMeteoService } from '../openMeteoService';
import { WeatherNativeService } from '../../../modules/weather-native-module';

describe('WeatherService', () => {
  beforeEach(() => {
    WeatherService.clearCache();
    jest.clearAllMocks();
  });

  test('returns complete weather data with fallbacks', async () => {
    const data = await WeatherService.getCurrentWeatherData();
    expect(data.location).toMatchObject({ name: 'New York', country: 'US' });
    expect(typeof data.current.temperature).toBe('number');
    expect(data.uvIndex.value).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(data.forecast)).toBe(true);
    expect(OpenMeteoService.getDailyForecast).toHaveBeenCalled();
  });

  test('uses cache to avoid duplicate location fetch', async () => {
    await WeatherService.getCurrentWeatherData();
    await WeatherService.getCurrentWeatherData();
    expect(LocationService.getCurrentLocation).toHaveBeenCalledTimes(1);
  });

  test('throws user-friendly error when location fails', async () => {
    (LocationService.getCurrentLocation as jest.Mock).mockRejectedValueOnce(new Error('loc-fail'));
    await expect(WeatherService.getCurrentWeatherData()).rejects.toThrow(
      /Unable to fetch weather data/i,
    );
  });

  test('uses native UV data when module available', async () => {
    // Make native module appear available for all checks in this flow
    (WeatherNativeService.isAvailable as jest.Mock).mockResolvedValue(true);
    // Force native location to fail so LocationService fallback is used
    (WeatherNativeService as any).getCurrentLocation = jest
      .fn()
      .mockRejectedValue(new Error('native fail'));
    // Provide native weather + UV data
    (WeatherNativeService.getUVIndexData as jest.Mock).mockResolvedValue({
      uvIndex: 9,
      maxUVToday: 10,
      peakTime: '1:00 PM',
    });
    (WeatherNativeService.getWeatherData as jest.Mock).mockResolvedValue({
      temperature: 24,
      description: 'Sunny',
      weatherCode: 0,
      humidity: 50,
      windSpeed: 3,
      pressure: 1013,
      visibility: 10,
      feelsLike: 25,
    });

    const data = await WeatherService.getCurrentWeatherData();
    expect(data.uvIndex.value).toBe(9);
    expect(data.uvIndex.level).toBe('Very High');
  });

  test('falls back to mock UV data if native throws', async () => {
    (WeatherNativeService.isAvailable as jest.Mock).mockResolvedValue(true);
    (WeatherNativeService as any).getCurrentLocation = jest
      .fn()
      .mockRejectedValue(new Error('native fail'));
    (WeatherNativeService.getUVIndexData as jest.Mock).mockRejectedValue(new Error('boom'));
    (WeatherNativeService.getWeatherData as jest.Mock).mockResolvedValue({
      temperature: 24,
      description: 'Sunny',
      weatherCode: 0,
      humidity: 50,
      windSpeed: 3,
      pressure: 1013,
      visibility: 10,
      feelsLike: 25,
    });

    const data = await WeatherService.getCurrentWeatherData();
    expect(data.uvIndex.value).toBe(7); // fallback value in service
    expect(['High', 'Very High', 'Extreme', 'Moderate', 'Low']).toContain(data.uvIndex.level);
  });
});
