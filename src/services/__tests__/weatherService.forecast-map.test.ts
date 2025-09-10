// Mock native service as unavailable to avoid native paths
jest.mock('../../../modules/weather-native-module', () => ({
  __esModule: true,
  WeatherNativeService: {
    isAvailable: jest.fn().mockResolvedValue(false),
  },
}));

// Mock LocationService to fixed coordinates
jest.mock('../locationService', () => ({
  LocationService: {
    getCurrentLocation: jest.fn().mockResolvedValue({ latitude: 10, longitude: 20 }),
    getDetailedLocationInfo: jest.fn().mockResolvedValue({ name: 'Test City', country: 'TC' }),
  },
}));

// Mock OpenMeteoService to return known values we can assert on
jest.mock('../openMeteoService', () => ({
  OpenMeteoService: {
    getDailyForecast: jest.fn().mockResolvedValue([
      {
        date: '2025-09-09',
        weatherCode: 3,
        maxTemp: 31.2,
        minTemp: 20.4,
        uvIndex: 8.6,
        precipitation: 1,
        precipitationProbability: 42,
      },
    ]),
  },
}));

import { WeatherService } from '../weatherService';

describe('WeatherService forecast mapping', () => {
  beforeEach(() => WeatherService.clearCache());

  it('maps precipitationProbability -> precipitationChance on DailyForecast', async () => {
    const data = await WeatherService.getCurrentWeatherData();
    expect(Array.isArray(data.forecast)).toBe(true);
    expect(data.forecast[0]).toMatchObject({
      date: '2025-09-09',
      maxTemp: 31,
      minTemp: 20,
      uvIndex: 9,
      precipitationChance: 42,
    });
  });
});
