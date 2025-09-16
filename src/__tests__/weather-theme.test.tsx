import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native/Libraries/Utilities/Platform', () => {
  const actual = jest.requireActual('react-native/Libraries/Utilities/Platform');
  return { ...actual, OS: 'ios', Version: 26 };
});
jest.mock('../services/weatherService', () => ({
  WeatherService: {
    getCurrentWeatherData: jest.fn(),
  },
}));

import WeatherRoute from '../../app/(tabs)/weather';
import { WeatherProvider } from '../context/WeatherContext';
import { SunscreenProvider } from '../context/SunscreenContext';
import { ThemeProvider as AppThemeProvider } from '../theme/theme';
import { WeatherService } from '../services/weatherService';
import { tokens } from '../theme/tokens';

const mockWeatherData: any = {
  location: { name: 'Lisbon', country: 'PT', lat: 38.7223, lon: -9.1393 },
  current: {
    temperature: 21,
    feelsLike: 20,
    humidity: 70,
    windSpeed: 10,
    description: 'Clear',
    icon: '01d',
    pressure: 1011,
    visibility: 9,
  },
  forecast: [],
  uvIndex: {
    value: 5,
    level: 'Moderate',
    maxToday: 7,
    peakTime: '13:00',
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

describe('Weather detail rows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (WeatherService.getCurrentWeatherData as jest.Mock).mockResolvedValue(mockWeatherData);
  });

  it('uses theme colors for labels and values', async () => {
    const { findByText } = renderWithProviders(<WeatherRoute />);

    await waitFor(() => expect(WeatherService.getCurrentWeatherData).toHaveBeenCalled());

    const humidityLabel = await findByText('weather.details.humidity');
    const humidityValue = await findByText('70%');

    const labelColor = StyleSheet.flatten(humidityLabel.props.style)?.color;
    const valueColor = StyleSheet.flatten(humidityValue.props.style)?.color;

    expect(labelColor).toBe(tokens.light.colors.secondary);
    expect(valueColor).toBe(tokens.light.colors.primary);
  });
});
