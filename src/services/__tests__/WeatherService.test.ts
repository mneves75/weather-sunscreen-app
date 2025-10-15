/**
 * WeatherService Tests
 *
 * Critical test coverage for cache mutations, API fallbacks, and error handling
 */

import { weatherService } from '../WeatherService';
import { openMeteoClient } from '../OpenMeteoClient';
import { Coordinates, WeatherData, UVIndex, Forecast } from '@/src/types';

// Mock the OpenMeteoClient
jest.mock('../OpenMeteoClient');

describe('WeatherService', () => {
  const mockCoordinates: Coordinates = {
    latitude: 37.7749,
    longitude: -122.4194,
  };

  const mockLocationDetails = {
    city: 'San Francisco',
    country: 'US',
    timezone: 'America/Los_Angeles',
  };

  beforeEach(() => {
    // Clear all caches before each test
    weatherService.clearCache();
    jest.clearAllMocks();
  });

  describe('Cache Immutability', () => {
    it('should not mutate cached weather data when adding location details', async () => {
      // Setup mock response
      const mockWeatherResponse = {
        current: {
          temperature_2m: 20,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          weather_code: 0,
          time: new Date().toISOString(),
        },
        current_units: { temperature_2m: '°C' },
      };

      (openMeteoClient.getCurrentWeather as jest.Mock).mockResolvedValue(mockWeatherResponse);
      (openMeteoClient.getUVIndex as jest.Mock).mockResolvedValue({
        hourly: {
          time: [new Date().toISOString()],
          uv_index: [6],
        },
      });

      // First call without location details
      const firstResult = await weatherService.getWeatherData(mockCoordinates);
      const firstLocation = { ...firstResult.location };

      // Second call with location details (should use cache)
      const secondResult = await weatherService.getWeatherData(
        mockCoordinates,
        mockLocationDetails
      );

      // The first result should NOT have been mutated
      expect(firstResult.location).toEqual(firstLocation);

      // The results should be different objects
      expect(secondResult.location).not.toBe(firstResult.location);

      // But second result should have updated location details
      expect(secondResult.location.city).toBe('San Francisco');
    });

    it('should create new forecast objects when updating location details from cache', async () => {
      const mockForecastResponse = {
        hourly: {
          time: [new Date().toISOString()],
          temperature_2m: [20],
          weather_code: [0],
        },
        daily: {
          time: [new Date().toISOString().split('T')[0]],
          temperature_2m_max: [25],
          temperature_2m_min: [15],
          weather_code: [0],
        },
      };

      (openMeteoClient.getForecast as jest.Mock).mockResolvedValue(mockForecastResponse);

      // First call
      const firstForecast = await weatherService.getForecast(mockCoordinates);
      const firstLocation = { ...firstForecast.location };

      // Second call with location details (cached)
      const secondForecast = await weatherService.getForecast(
        mockCoordinates,
        mockLocationDetails
      );

      // First forecast location should not be mutated
      expect(firstForecast.location).toEqual(firstLocation);

      // Second forecast should have new location object
      expect(secondForecast.location).not.toBe(firstForecast.location);
    });
  });

  it('maps daylight data into forecast days', async () => {
    const hourlyTime = [
      '2025-01-01T00:00:00Z',
      '2025-01-01T06:00:00Z',
      '2025-01-01T12:00:00Z',
      '2025-01-01T18:00:00Z',
    ];

    (openMeteoClient.getForecast as jest.Mock).mockResolvedValue({
      hourly: {
        time: hourlyTime,
        temperature_2m: [12, 16, 22, 18],
        relative_humidity_2m: [80, 70, 60, 65],
        uv_index: [0, 3, 7, 2],
        wind_speed_10m: [5, 7, 9, 6],
        wind_direction_10m: [180, 200, 220, 190],
        precipitation_probability: [10, 20, 40, 30],
        cloud_cover: [20, 30, 40, 50],
        weather_code: [0, 0, 1, 2],
      },
      daily: {
        time: ['2025-01-01'],
        temperature_2m_max: [24],
        temperature_2m_min: [12],
        uv_index_max: [9],
        precipitation_probability_max: [40],
        wind_speed_10m_max: [12],
        wind_direction_10m_dominant: [210],
        sunrise: ['2025-01-01T06:32:00Z'],
        sunset: ['2025-01-01T18:21:00Z'],
        daylight_duration: [42360],
      },
    });

    const forecast = await weatherService.getForecast(mockCoordinates);

    expect(forecast.days[0].sunrise).toBeDefined();
    expect(forecast.days[0].sunset).toBeDefined();
    expect(forecast.days[0].daylight.daylightDuration).toBeGreaterThan(0);
    expect(forecast.days[0].daylight.solarNoon).not.toBe('');
  });

  it('returns hourly uv points alongside summary', async () => {
    const nowIso = new Date().toISOString();
    (openMeteoClient.getUVIndex as jest.Mock).mockResolvedValue({
      hourly: {
        time: [nowIso, new Date(Date.now() + 3600000).toISOString()],
        uv_index: [4.2, 6.1],
      },
    });

    const uv = await weatherService.getUVIndex(mockCoordinates);

    expect(uv.hourly.length).toBeGreaterThan(0);
    expect(uv.hourly[0].timestamp).toBeGreaterThan(0);
    expect(uv.hourly[0].value).toBeGreaterThanOrEqual(0);
  });

  describe('Cache Validation', () => {
    it('should return cached data when coordinates match and cache is fresh', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 20,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          weather_code: 0,
          time: new Date().toISOString(),
        },
        current_units: { temperature_2m: '°C' },
      };

      (openMeteoClient.getCurrentWeather as jest.Mock).mockResolvedValue(mockResponse);
      (openMeteoClient.getUVIndex as jest.Mock).mockResolvedValue({
        hourly: {
          time: [new Date().toISOString()],
          uv_index: [6],
        },
      });

      // First call
      await weatherService.getWeatherData(mockCoordinates);

      // Second call should use cache
      await weatherService.getWeatherData(mockCoordinates);

      // API should only be called once
      expect(openMeteoClient.getCurrentWeather).toHaveBeenCalledTimes(1);
    });

    it('should fetch new data when coordinates change', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 20,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          weather_code: 0,
          time: new Date().toISOString(),
        },
        current_units: { temperature_2m: '°C' },
      };

      (openMeteoClient.getCurrentWeather as jest.Mock).mockResolvedValue(mockResponse);
      (openMeteoClient.getUVIndex as jest.Mock).mockResolvedValue({
        hourly: {
          time: [new Date().toISOString()],
          uv_index: [6],
        },
      });

      // First location
      await weatherService.getWeatherData(mockCoordinates);

      // Different location
      const newCoords = { latitude: 40.7128, longitude: -74.0060 };
      await weatherService.getWeatherData(newCoords);

      // API should be called twice
      expect(openMeteoClient.getCurrentWeather).toHaveBeenCalledTimes(2);
    });

    it('should invalidate cache after timeout', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 20,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          weather_code: 0,
          time: new Date().toISOString(),
        },
        current_units: { temperature_2m: '°C' },
      };

      (openMeteoClient.getCurrentWeather as jest.Mock).mockResolvedValue(mockResponse);
      (openMeteoClient.getUVIndex as jest.Mock).mockResolvedValue({
        hourly: {
          time: [new Date().toISOString()],
          uv_index: [6],
        },
      });

      // First call
      await weatherService.getWeatherData(mockCoordinates);

      // Mock time passing (cache timeout is 5 minutes = 300000ms)
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 400000);

      // Second call should fetch new data
      await weatherService.getWeatherData(mockCoordinates);

      expect(openMeteoClient.getCurrentWeather).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling & Fallbacks', () => {
    it('should return stale cache data when API fails', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 20,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          weather_code: 0,
          time: new Date().toISOString(),
        },
        current_units: { temperature_2m: '°C' },
      };

      // First successful call
      (openMeteoClient.getCurrentWeather as jest.Mock).mockResolvedValueOnce(mockResponse);
      (openMeteoClient.getUVIndex as jest.Mock).mockResolvedValue({
        hourly: {
          time: [new Date().toISOString()],
          uv_index: [6],
        },
      });

      const firstResult = await weatherService.getWeatherData(mockCoordinates);

      // Second call fails
      (openMeteoClient.getCurrentWeather as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      // Mock expired cache
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 400000);

      const secondResult = await weatherService.getWeatherData(mockCoordinates);

      // Should return stale cached data
      expect(secondResult).toBeDefined();
      expect(secondResult.current.temperature).toBe(firstResult.current.temperature);
    });

    it('should return mock data when API fails and no cache exists', async () => {
      (openMeteoClient.getCurrentWeather as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const result = await weatherService.getWeatherData(mockCoordinates);

      // Should return mock data
      expect(result).toBeDefined();
      expect(result.current.temperature).toBeDefined();
      expect(result.location.coordinates).toEqual(mockCoordinates);
    });

    it('should continue without UV index if UV fetch fails', async () => {
      const mockWeatherResponse = {
        current: {
          temperature_2m: 20,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          weather_code: 0,
          time: new Date().toISOString(),
        },
        current_units: { temperature_2m: '°C' },
      };

      (openMeteoClient.getCurrentWeather as jest.Mock).mockResolvedValue(mockWeatherResponse);
      (openMeteoClient.getUVIndex as jest.Mock).mockRejectedValue(new Error('UV API error'));

      const result = await weatherService.getWeatherData(mockCoordinates);

      // Should still return weather data
      expect(result).toBeDefined();
      expect(result.current.temperature).toBe(20);
    });
  });

  describe('Cache Management', () => {
    it('should clear all caches', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 20,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          weather_code: 0,
          time: new Date().toISOString(),
        },
        current_units: { temperature_2m: '°C' },
      };

      (openMeteoClient.getCurrentWeather as jest.Mock).mockResolvedValue(mockResponse);
      (openMeteoClient.getUVIndex as jest.Mock).mockResolvedValue({
        hourly: {
          time: [new Date().toISOString()],
          uv_index: [6],
        },
      });

      // Populate cache
      await weatherService.getWeatherData(mockCoordinates);

      // Clear cache
      weatherService.clearCache();

      // Next call should fetch new data
      await weatherService.getWeatherData(mockCoordinates);

      expect(openMeteoClient.getCurrentWeather).toHaveBeenCalledTimes(2);
    });

    it('should refresh data and bypass cache', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 20,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          weather_code: 0,
          time: new Date().toISOString(),
        },
        current_units: { temperature_2m: '°C' },
      };

      (openMeteoClient.getCurrentWeather as jest.Mock).mockResolvedValue(mockResponse);
      (openMeteoClient.getUVIndex as jest.Mock).mockResolvedValue({
        hourly: { uv_index: [6] },
      });

      // First call
      await weatherService.getWeatherData(mockCoordinates);

      // Refresh should bypass cache
      await weatherService.refreshWeatherData(mockCoordinates);

      expect(openMeteoClient.getCurrentWeather).toHaveBeenCalledTimes(2);
    });
  });

  describe('UV Index Calculations', () => {
    it('should correctly calculate UV levels', () => {
      expect(weatherService.calculateUVLevel(1)).toBe('low');
      expect(weatherService.calculateUVLevel(4)).toBe('moderate');
      expect(weatherService.calculateUVLevel(6)).toBe('high');
      expect(weatherService.calculateUVLevel(9)).toBe('very-high');
      expect(weatherService.calculateUVLevel(11)).toBe('extreme');
    });

    it('should calculate SPF recommendations based on UV and skin type', () => {
      // Very fair skin in extreme UV
      expect(weatherService.getSPFRecommendation(10, 'very-fair')).toBe(50);

      // Medium skin in moderate UV
      expect(weatherService.getSPFRecommendation(4, 'medium')).toBe(20);

      // Olive skin in high UV
      expect(weatherService.getSPFRecommendation(7, 'olive')).toBe(25);
    });
  });
});
