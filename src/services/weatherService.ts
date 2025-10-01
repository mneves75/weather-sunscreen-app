import { Platform } from 'react-native';
import { WeatherNativeService } from '../../modules/weather-native-module';
import {
  WeatherData,
  Location as LocationType,
  UVIndexData,
  DailyForecast,
} from '../types/weather';
import { LocationService } from './locationService';
import { OpenMeteoService } from './openMeteoService';
import { getWeatherDescription, getWeatherIcon } from '../utils/weatherCodeMapping';
import { logger } from './loggerService';
import { queryClient } from './queryClient';
import { weatherQueryKeys } from './weatherQueryKeys';
import i18n from '../i18n';
import { TIMINGS, LIMITS } from '../constants/timings';

type UVGuidanceKey = 'low' | 'moderate' | 'high' | 'veryHigh' | 'extreme';

const UV_SPF_MAP: Record<UVGuidanceKey, number> = {
  low: 15,
  moderate: 30,
  high: 30,
  veryHigh: 50,
  extreme: 50,
};

interface UVGuidanceBundle {
  frequency: string;
  tips: string[];
  skin: { fair: string; medium: string; dark: string };
}

const UV_GUIDANCE_FALLBACK: Record<UVGuidanceKey, UVGuidanceBundle> = {
  low: {
    frequency: 'Every 3-4 hours',
    tips: ['Minimal protection needed', 'Safe to be outside'],
    skin: {
      fair: 'SPF 15+ recommended',
      medium: 'SPF 15+ recommended',
      dark: 'SPF 15+ recommended',
    },
  },
  moderate: {
    frequency: 'Every 2-3 hours',
    tips: ['Wear sunglasses', 'Use shade during peak hours'],
    skin: {
      fair: 'SPF 30+ recommended',
      medium: 'SPF 15+ recommended',
      dark: 'SPF 15+ recommended',
    },
  },
  high: {
    frequency: 'Every 2 hours',
    tips: ['Seek shade during peak hours', 'Wear protective clothing'],
    skin: {
      fair: 'SPF 50+ recommended',
      medium: 'SPF 30+ recommended',
      dark: 'SPF 15+ recommended',
    },
  },
  veryHigh: {
    frequency: 'Every 1-2 hours',
    tips: ['Avoid sun exposure 10 AM - 4 PM', 'Wear protective clothing and sunglasses'],
    skin: {
      fair: 'SPF 50+ recommended',
      medium: 'SPF 50+ recommended',
      dark: 'SPF 30+ recommended',
    },
  },
  extreme: {
    frequency: 'Every hour',
    tips: ['Avoid sun exposure', 'Stay indoors or in deep shade', 'Wear full protective clothing'],
    skin: {
      fair: 'SPF 50+ recommended - avoid sun',
      medium: 'SPF 50+ recommended',
      dark: 'SPF 50+ recommended',
    },
  },
};

export class WeatherService {
  private static readonly CACHE_DURATION = TIMINGS.WEATHER_CACHE_DURATION;
  private static lastResolvedLocation?: { location: LocationType; timestamp: number };
  static async getCurrentWeatherData(locationOverride?: LocationType): Promise<WeatherData> {
    try {
      const location = locationOverride ?? (await this.resolveCurrentLocation());

      // Get weather and UV data in parallel with proper error handling
      const [weatherResult, uvResult] = await Promise.allSettled([
        this.getWeatherDataForLocation(location),
        this.getUVIndexDataForLocation(location),
      ]);

      // Handle weather data result
      if (weatherResult.status === 'rejected') {
        logger.error('Weather data fetch failed', new Error(weatherResult.reason));
        throw new Error('Unable to fetch weather data');
      }
      const weatherData = weatherResult.value;

      // Handle UV data result with fallback
      let uvData: UVIndexData;
      if (uvResult.status === 'rejected') {
        logger.warn('UV data fetch failed, using fallback', { error: uvResult.reason });
        // Provide fallback UV data
        uvData = {
          value: 0,
          level: 'Low',
          maxToday: 0,
          peakTime: '—',
          sunscreenRecommendation: this.getSunscreenRecommendation(0),
          hourly: [],
        };
      } else {
        uvData = uvResult.value;
      }

      // Get detailed location information using our enhanced location service
      const locationInfo = await LocationService.getDetailedLocationInfo(location);

      const completeWeatherData: WeatherData = {
        location: {
          name: locationInfo.name,
          country: locationInfo.country,
          lat: location.latitude,
          lon: location.longitude,
        },
        current: weatherData,
        forecast: await this.getForecastData(location),
        uvIndex: uvData,
      };

      return completeWeatherData;
    } catch (error) {
      logger.error(
        'Failed to get weather data',
        error instanceof Error ? error : new Error(String(error)),
      );
      throw new Error(
        'Unable to fetch weather data. Please check your location settings and internet connection.',
      );
    }
  }

  static async resolveCurrentLocation(): Promise<LocationType> {
    const now = Date.now();
    if (
      this.lastResolvedLocation &&
      now - this.lastResolvedLocation.timestamp < this.CACHE_DURATION
    ) {
      return this.lastResolvedLocation.location;
    }
    try {
      // Try native module first for better performance
      const nativeAvailable = await WeatherNativeService.isAvailable();
      if (nativeAvailable) {
        const loc = await WeatherNativeService.getCurrentLocation();
        this.lastResolvedLocation = { location: loc, timestamp: Date.now() };
        return loc;
      }
    } catch (error) {
      logger.warn('Native location service failed, falling back to enhanced location service', {
        error: String(error),
      });
    }

    // Fallback to our enhanced location service
    const loc = await LocationService.getCurrentLocation();
    this.lastResolvedLocation = { location: loc, timestamp: Date.now() };
    return loc;
  }

  private static async getWeatherDataForLocation(location: LocationType) {
    let fallbackUsed = false;
    let fallbackReason: string | null = null;
    let parityDelta: number | null = null;

    try {
      const nativeAvailable = await WeatherNativeService.isAvailable();
      if (nativeAvailable) {
        const nativeData = await WeatherNativeService.getWeatherData(
          location.latitude,
          location.longitude,
        );
        const weatherCode = nativeData.weatherCode ?? 0; // Default to clear sky if not provided

        // Parity check: sample-based in production (10%), always-on in development
        const shouldCheckParity = __DEV__ || Math.random() < LIMITS.PARITY_CHECK_SAMPLE_RATE;

        if (shouldCheckParity) {
          try {
            const comparison = await OpenMeteoService.getCurrentWeather(location);
            parityDelta = nativeData.temperature - comparison.temperature;

            // Alert on significant temperature differences
            const absDelta = Math.abs(parityDelta);
            if (absDelta > LIMITS.TEMPERATURE_DELTA_CRITICAL) {
              logger.error(
                'CRITICAL: Large temperature delta detected',
                new Error(`Temperature delta: ${parityDelta}°C`),
                {
                  nativeTemp: nativeData.temperature,
                  openMeteoTemp: comparison.temperature,
                  delta: parityDelta,
                  location: {
                    lat: location.latitude,
                    lon: location.longitude,
                  },
                  sampled: !__DEV__,
                },
              );
            } else if (absDelta > LIMITS.TEMPERATURE_DELTA_WARNING) {
              logger.warn('WARNING: Notable temperature delta detected', {
                nativeTemp: nativeData.temperature,
                openMeteoTemp: comparison.temperature,
                delta: parityDelta,
                location: {
                  lat: location.latitude,
                  lon: location.longitude,
                },
                sampled: !__DEV__,
              });
            } else if (__DEV__) {
              logger.info('Temperature parity check passed', {
                delta: parityDelta,
              });
            }
          } catch (comparisonError) {
            logger.warn('Parity comparison failed for native weather data', {
              error: String(comparisonError),
            });
            parityDelta = null;
          }
        } else {
          // Skipped parity check (sampled out)
          parityDelta = null;
        }
        this.logFallbackTelemetry('weather', false, null, {
          deltaTemperature: parityDelta,
        });
        return {
          ...nativeData,
          icon: getWeatherIcon(weatherCode),
        };
      }
      fallbackUsed = true;
      fallbackReason = 'native_unavailable';
    } catch (error) {
      fallbackUsed = true;
      fallbackReason = 'native_error';
      logger.warn('Native weather service failed, falling back to Open-Meteo current weather', {
        error: String(error),
      });
    }

    try {
      const fallback = await OpenMeteoService.getCurrentWeather(location);
      const result = {
        temperature: Math.round(fallback.temperature),
        description: getWeatherDescription(fallback.weatherCode),
        icon: getWeatherIcon(fallback.weatherCode),
        humidity:
          fallback.humidity != null && Number.isFinite(fallback.humidity)
            ? Math.round(fallback.humidity)
            : null,
        windSpeed: Number(fallback.windSpeed.toFixed(1)),
        pressure: Math.round(fallback.pressure || 1013),
        visibility: null,
        feelsLike: Math.round(fallback.temperature),
      };
      this.logFallbackTelemetry('weather', true, fallbackReason ?? 'open_meteo_success', {
        deltaTemperature: parityDelta,
      });
      return result;
    } catch (error) {
      fallbackUsed = true;
      fallbackReason = fallbackReason ?? 'open_meteo_error';
      logger.warn('Open-Meteo current weather failed, using mock data', { error: String(error) });
      const mockCode = 0; // clear sky
      const mockTemp = 24;
      const result = {
        temperature: mockTemp,
        description: getWeatherDescription(mockCode),
        icon: getWeatherIcon(mockCode),
        humidity: 55,
        windSpeed: 3,
        pressure: 1013,
        visibility: null,
        feelsLike: mockTemp,
      };
      this.logFallbackTelemetry('weather', fallbackUsed, fallbackReason, {
        deltaTemperature: parityDelta,
      });
      return result;
    }
  }

  private static async getUVIndexDataForLocation(location: LocationType): Promise<UVIndexData> {
    let fallbackUsed = false;
    let fallbackReason: string | null = null;

    try {
      const nativeAvailable = await WeatherNativeService.isAvailable();
      if (nativeAvailable) {
        const uvData = await WeatherNativeService.getUVIndexData(
          location.latitude,
          location.longitude,
        );
        this.logFallbackTelemetry('uv', false, null, {
          deltaUV: null,
        });
        return {
          value: uvData.uvIndex,
          level: this.getUVLevel(uvData.uvIndex),
          maxToday: uvData.maxUVToday,
          peakTime: uvData.peakTime,
          sunscreenRecommendation: this.getSunscreenRecommendation(uvData.uvIndex),
          hourly: [],
        };
      }
      fallbackUsed = true;
      fallbackReason = 'native_unavailable';
    } catch (error) {
      fallbackUsed = true;
      fallbackReason = 'native_error';
      logger.warn('Native UV service failed, using mock data', { error: String(error) });
    }

    try {
      const [daily] = await OpenMeteoService.getDailyForecast(location, 1);
      const hourly = await OpenMeteoService.getHourlyForecast(location, 24);
      const hourlyUv = hourly
        .filter((point) => typeof point.uvIndex === 'number' && point.uvIndex != null)
        .map((point) => ({ time: point.time, uv: Number((point.uvIndex ?? 0).toFixed(1)) }));

      const primaryValue = hourlyUv[0]?.uv ?? (daily ? Number((daily.uvIndex ?? 0).toFixed(1)) : 0);
      const value = Math.round(primaryValue);
      const peakPoint = hourlyUv.reduce<{ time: string; uv: number } | null>((highest, current) => {
        if (!highest) return current;
        return current.uv > highest.uv ? current : highest;
      }, hourlyUv[0] ?? null);
      const peakTime = peakPoint
        ? new Date(peakPoint.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : '—';

      const result: UVIndexData = {
        value,
        level: this.getUVLevel(value),
        maxToday: Math.round(daily?.uvIndex ?? value),
        peakTime,
        sunscreenRecommendation: this.getSunscreenRecommendation(value),
        hourly: hourlyUv,
      };
      this.logFallbackTelemetry('uv', fallbackUsed, fallbackReason ?? 'open_meteo_success', {
        deltaUV: null,
      });
      return result;
    } catch (error) {
      fallbackUsed = true;
      fallbackReason = fallbackReason ?? 'open_meteo_error';
      logger.warn('Open-Meteo UV fallback failed, using mock data', { error: String(error) });
    }

    const uvValue = 7;
    const result: UVIndexData = {
      value: uvValue,
      level: this.getUVLevel(uvValue),
      maxToday: 9,
      peakTime: '12:00 PM',
      sunscreenRecommendation: this.getSunscreenRecommendation(uvValue),
      hourly: [],
    };
    this.logFallbackTelemetry('uv', fallbackUsed, fallbackReason ?? 'mock_data', {
      deltaUV: null,
    });
    return result;
  }

  private static getUVLevel(
    uvIndex: number,
  ): 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme' {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
  }

  private static getUVGuidanceKey(uvIndex: number): UVGuidanceKey {
    if (uvIndex <= 2) return 'low';
    if (uvIndex <= 5) return 'moderate';
    if (uvIndex <= 7) return 'high';
    if (uvIndex <= 10) return 'veryHigh';
    return 'extreme';
  }

  private static getSunscreenRecommendation(uvIndex: number) {
    const key = this.getUVGuidanceKey(uvIndex);
    const fallback = UV_GUIDANCE_FALLBACK[key];
    const guidanceRaw = i18n.t(`uv.guidance.${key}`, {
      returnObjects: true,
      defaultValue: fallback,
    });

    let guidance: UVGuidanceBundle = fallback;
    if (typeof guidanceRaw === 'object' && guidanceRaw !== null && !Array.isArray(guidanceRaw)) {
      const bundle = guidanceRaw as Partial<UVGuidanceBundle>;
      const tips =
        Array.isArray(bundle.tips) && bundle.tips.length > 0
          ? (bundle.tips as string[])
          : fallback.tips;
      const skinBundle = (bundle.skin ?? {}) as Partial<UVGuidanceBundle['skin']>;
      guidance = {
        frequency: bundle.frequency ?? fallback.frequency,
        tips,
        skin: {
          fair: skinBundle.fair ?? fallback.skin.fair,
          medium: skinBundle.medium ?? fallback.skin.medium,
          dark: skinBundle.dark ?? fallback.skin.dark,
        },
      };
    }

    return {
      spf: UV_SPF_MAP[key],
      applicationFrequency: guidance.frequency,
      additionalTips: guidance.tips,
      skinTypeRecommendations: guidance.skin,
    };
  }

  private static async getForecastData(
    location: LocationType,
    days: number = 7,
  ): Promise<DailyForecast[]> {
    try {
      logger.info('Fetching 7-day forecast using Open-Meteo API');

      // Get forecast data from Open-Meteo
      const openMeteoForecast = await OpenMeteoService.getDailyForecast(location, days);

      // Transform Open-Meteo data to our DailyForecast format
      const forecast: DailyForecast[] = openMeteoForecast.map((day) => ({
        date: day.date,
        maxTemp: Math.round(day.maxTemp),
        minTemp: Math.round(day.minTemp),
        description: getWeatherDescription(day.weatherCode),
        icon: getWeatherIcon(day.weatherCode),
        humidity: day.humidityMean != null ? Math.round(day.humidityMean) : null,
        uvIndex: Math.round(day.uvIndex),
        precipitationChance: Math.round(day.precipitationProbability),
      }));

      logger.info('Successfully mapped forecast days', { count: forecast.length });
      return forecast;
    } catch (error) {
      logger.error(
        'Failed to fetch forecast data',
        error instanceof Error ? error : new Error(String(error)),
      );

      // Return empty array to show "coming soon" message rather than breaking the app
      // This ensures the current weather still works even if forecast fails
      logger.info('Falling back to empty forecast due to API error');
      return [];
    }
  }

  static clearCache(): void {
    queryClient.removeQueries({ queryKey: weatherQueryKeys.all });
    this.lastResolvedLocation = undefined;
  }

  static invalidateLocation(location: LocationType): void {
    queryClient.invalidateQueries({ queryKey: weatherQueryKeys.location(location) });
  }

  static async getForecastForLocation(location: LocationType, days = 7): Promise<DailyForecast[]> {
    return this.getForecastData(location, days);
  }

  private static logFallbackTelemetry(
    channel: 'weather' | 'uv',
    fallbackUsed: boolean,
    reason: string | null,
    metrics?: { deltaTemperature?: number | null; deltaUV?: number | null },
  ): void {
    const eventName = channel === 'weather' ? 'weather_fallback_usage' : 'uv_fallback_usage';
    logger.info(eventName, {
      channel,
      fallbackUsed,
      reason: fallbackUsed ? (reason ?? 'unknown') : 'native',
      platform: Platform.OS,
      deltaTemperature: metrics?.deltaTemperature ?? null,
      deltaUV: metrics?.deltaUV ?? null,
    });
  }
}
