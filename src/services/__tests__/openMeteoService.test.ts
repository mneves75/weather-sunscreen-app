import { OpenMeteoService } from '../openMeteoService';

// Minimal location stub
const location = { latitude: 37.7749, longitude: -122.4194 } as const;

// Helper to mock fetch with a controlled response
const mockForecast = (days = 2) => ({
  latitude: location.latitude,
  longitude: location.longitude,
  generationtime_ms: 1,
  utc_offset_seconds: 0,
  timezone: 'GMT',
  timezone_abbreviation: 'GMT',
  elevation: 0,
  daily_units: {
    time: 'iso8601',
    weather_code: 'wmo',
    temperature_2m_max: '°C',
    temperature_2m_min: '°C',
    uv_index_max: 'index',
    precipitation_sum: 'mm',
    precipitation_probability_max: '%',
  },
  daily: {
    time: Array.from({ length: days }, (_, i) => `2025-01-0${i + 1}`),
    weather_code: [0, 2].slice(0, days),
    temperature_2m_max: [20, 22].slice(0, days),
    temperature_2m_min: [10, 12].slice(0, days),
    uv_index_max: [7, 8].slice(0, days),
    precipitation_sum: [0, 1].slice(0, days),
    precipitation_probability_max: [10, 20].slice(0, days),
  },
});

describe('OpenMeteoService.getDailyForecast', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockForecast(2),
    });
    OpenMeteoService.clearCache();
  });

  test('fetches and maps forecast data', async () => {
    const result = await OpenMeteoService.getDailyForecast(location as any, 2);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ date: '2025-01-01', weatherCode: 0, maxTemp: 20 });
    expect(result[1]).toMatchObject({ date: '2025-01-02', weatherCode: 2, uvIndex: 8 });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('uses cache on subsequent calls', async () => {
    await OpenMeteoService.getDailyForecast(location as any, 2);
    await OpenMeteoService.getDailyForecast(location as any, 2);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('clamps forecast_days to minimum 1 when days <= 0', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch' as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockForecast(1) } as any);
    await OpenMeteoService.getDailyForecast(location as any, 0);
    const calledUrl = (fetchSpy as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('forecast_days=1');
  });

  test('clamps forecast_days to maximum 16 when days is very large', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch' as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockForecast(16) } as any);
    await OpenMeteoService.getDailyForecast(location as any, 99);
    const calledUrl = (fetchSpy as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('forecast_days=16');
  });

  test('returns cached data when API fails after successful cache', async () => {
    // prime cache
    await OpenMeteoService.getDailyForecast(location as any, 2);
    // now fail
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'err',
    });
    const result = await OpenMeteoService.getDailyForecast(location as any, 2);
    expect(result).toHaveLength(2);
  });
});
