import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mocks
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native/Libraries/Utilities/Platform', () => {
  const actual = jest.requireActual('react-native/Libraries/Utilities/Platform');
  return { ...actual, OS: 'ios', Version: '26.0' };
});
jest.mock('../../services/weatherService', () => ({
  WeatherService: {
    getCurrentWeatherData: jest.fn(),
  },
}));

import WeatherRoute from '../../../app/(tabs)/weather';
import ForecastRoute from '../../../app/(tabs)/forecast';
import { WeatherProvider } from '../../context/WeatherContext';
import { SunscreenProvider } from '../../context/SunscreenContext';
import { ThemeProvider as AppThemeProvider } from '../../theme/theme';
import { WeatherService } from '../../services/weatherService';
import { tokens } from '../../theme/tokens';

describe('Weather App Integration (iOS 26)', () => {
  const mockWeatherData: any = {
    location: { name: 'New York', country: 'US', lat: 40.7128, lon: -74.006 },
    current: {
      temperature: 22,
      feelsLike: 20,
      humidity: 65,
      windSpeed: 15,
      description: 'Clear',
      icon: '01d',
      pressure: 1013,
      visibility: 10,
    },
    forecast: [],
    uvIndex: {
      value: 6,
      level: 'High',
      maxToday: 8,
      peakTime: '12:00 PM',
      sunscreenRecommendation: {
        spf: 30,
        applicationFrequency: 'Every 2 hours',
        additionalTips: [],
        skinTypeRecommendations: { fair: '', medium: '', dark: '' },
      },
    },
  };

  const renderWithProviders = (component: React.ReactElement) =>
    render(
      <AppThemeProvider>
        <WeatherProvider>
          <SunscreenProvider>{component}</SunscreenProvider>
        </WeatherProvider>
      </AppThemeProvider>,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (WeatherService.getCurrentWeatherData as jest.Mock).mockResolvedValue(mockWeatherData);
  });

  test('WeatherScreen displays current temperature and location', async () => {
    const { findByText } = renderWithProviders(<WeatherRoute />);
    await waitFor(async () => {
      expect(WeatherService.getCurrentWeatherData).toHaveBeenCalled();
      expect(await findByText(/22°C/)).toBeTruthy();
      expect(await findByText(/New York/)).toBeTruthy();
    });
  });

  test('ForecastScreen shows at least 7 forecast entries', async () => {
    const mockForecast = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 86400000).toISOString(),
      maxTemp: 25 + i,
      minTemp: 15 + i,
      description: 'Clear',
      icon: '01d',
      humidity: 0,
      uvIndex: 0,
      precipitationChance: 0,
    }));
    (WeatherService.getCurrentWeatherData as jest.Mock).mockResolvedValueOnce({
      ...mockWeatherData,
      forecast: mockForecast,
    });

    const tree = render(
      <AppThemeProvider>
        <WeatherProvider>
          <SunscreenProvider>
            <WeatherRoute />
            <ForecastRoute />
          </SunscreenProvider>
        </WeatherProvider>
      </AppThemeProvider>,
    );

    await waitFor(async () => {
      const items = await tree.findAllByText(/°/);
      expect(items.length).toBeGreaterThanOrEqual(7);
    });
  });

  test('Weather details rows respect themed colors', async () => {
    const { findByText } = renderWithProviders(<WeatherRoute />);

    const humidityLabel = await findByText('Humidity');
    const humidityValue = await findByText('65%');

    const labelStyle = StyleSheet.flatten(humidityLabel.props.style);
    const valueStyle = StyleSheet.flatten(humidityValue.props.style);

    expect(labelStyle?.color).toBe(tokens.light.colors.secondary);
    expect(valueStyle?.color).toBe(tokens.light.colors.primary);
  });
});
