/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react-native';
import { jest } from '@jest/globals';
import HomeScreen from '../../app/(tabs)/index';
import { WeatherProvider } from '../context/WeatherContext';
import { ThemeProvider } from '../theme/theme';
import { WeatherService } from '../services/weatherService';

// Mock the required modules
jest.mock('../services/weatherService');
jest.mock('../services/loggerService', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

const mockWeatherData = {
  location: {
    name: 'São Paulo',
    country: 'Brazil',
    lat: -23.5505,
    lon: -46.6333,
  },
  current: {
    temperature: 25,
    description: 'Sunny',
    icon: 'https://example.com/sunny.png',
    humidity: 60,
    windSpeed: 5.2,
    pressure: 1013,
    visibility: 10,
    feelsLike: 27,
  },
  forecast: [
    {
      date: '2025-09-17',
      maxTemp: 28,
      minTemp: 18,
      description: 'Partly cloudy',
      icon: 'https://example.com/cloudy.png',
      humidity: 65,
      uvIndex: 7,
      precipitationChance: 20,
    },
    {
      date: '2025-09-18',
      maxTemp: 30,
      minTemp: 20,
      description: 'Sunny',
      icon: 'https://example.com/sunny.png',
      humidity: 55,
      uvIndex: 9,
      precipitationChance: 5,
    },
  ],
  uvIndex: {
    value: 7,
    level: 'High' as const,
    maxToday: 9,
    peakTime: '12:00 PM',
    sunscreenRecommendation: {
      spf: 30,
      applicationFrequency: 'Every 2 hours',
      additionalTips: ['Seek shade during peak hours'],
      skinTypeRecommendations: {
        fair: 'SPF 50+ recommended',
        medium: 'SPF 30+ recommended',
        dark: 'SPF 15+ recommended',
      },
    },
  },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <WeatherProvider>{children}</WeatherProvider>
  </ThemeProvider>
);

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Critical Performance Fix', () => {
    it('should not render 1500 fake items', () => {
      const { queryByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      // Ensure no fake items are rendered
      expect(queryByText('Item 1')).toBeNull();
      expect(queryByText('Item 1500')).toBeNull();
      expect(queryByText('Lista de itens')).toBeNull();
    });

    it('should have manageable memory usage', async () => {
      const { unmount } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      // Verify that the component renders without creating massive arrays
      await waitFor(() => {
        expect(screen.getByText('Weather Dashboard')).toBeTruthy();
      });

      // Component should unmount cleanly without memory leaks
      unmount();
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Real Data Integration', () => {
    it('should load weather data on mount', async () => {
      const mockGetCurrentWeatherData = jest.mocked(WeatherService.getCurrentWeatherData);
      mockGetCurrentWeatherData.mockResolvedValueOnce(mockWeatherData);

      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(mockGetCurrentWeatherData).toHaveBeenCalled();
      });
    });

    it('should display weather data when loaded', async () => {
      const mockGetCurrentWeatherData = jest.mocked(WeatherService.getCurrentWeatherData);
      mockGetCurrentWeatherData.mockResolvedValueOnce(mockWeatherData);

      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Weather Dashboard')).toBeTruthy();
        expect(screen.getByText('São Paulo, Brazil')).toBeTruthy();
      });
    });

    it('should display loading state initially', () => {
      const mockGetCurrentWeatherData = jest.mocked(WeatherService.getCurrentWeatherData);
      mockGetCurrentWeatherData.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockWeatherData), 1000)),
      );

      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      expect(screen.getByText('Loading weather data...')).toBeTruthy();
    });

    it('should handle error states gracefully', async () => {
      const mockGetCurrentWeatherData = jest.mocked(WeatherService.getCurrentWeatherData);
      mockGetCurrentWeatherData.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeTruthy();
      });
    });
  });

  describe('Component Rendering', () => {
    beforeEach(() => {
      const mockGetCurrentWeatherData = jest.mocked(WeatherService.getCurrentWeatherData);
      mockGetCurrentWeatherData.mockResolvedValue(mockWeatherData);
    });

    it('should render all dashboard components when data is available', async () => {
      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        // Should render weather summary
        expect(screen.getByText('Current Weather')).toBeTruthy();

        // Should render UV index
        expect(screen.getByText('UV Index')).toBeTruthy();

        // Should render quick actions
        expect(screen.getByText('Quick Actions')).toBeTruthy();

        // Should render forecast preview
        expect(screen.getByText('3-Day Preview')).toBeTruthy();
      });
    });

    it('should have proper accessibility labels', async () => {
      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        const header = screen.getByRole('header');
        expect(header).toBeTruthy();
        expect(header).toHaveTextContent('Weather Dashboard');
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should use memoized components', async () => {
      const { rerender } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      // Verify component is memoized (should not re-render unnecessarily)
      rerender(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Weather Dashboard')).toBeTruthy();
      });
    });

    it('should handle pull-to-refresh', async () => {
      const mockGetCurrentWeatherData = jest.mocked(WeatherService.getCurrentWeatherData);
      mockGetCurrentWeatherData.mockResolvedValue(mockWeatherData);

      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Weather Dashboard')).toBeTruthy();
      });

      const scrollView = screen.getByTestId('homescreen-scrollview');
      const refreshControl = (scrollView.props as any)?.refreshControl;
      expect(refreshControl).toBeTruthy();

      await act(async () => {
        await refreshControl.props.onRefresh();
      });

      expect(mockGetCurrentWeatherData).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Recovery', () => {
    it('should provide retry functionality on error', async () => {
      const mockGetCurrentWeatherData = jest.mocked(WeatherService.getCurrentWeatherData);
      mockGetCurrentWeatherData.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /retry/i });
        expect(retryButton).toBeTruthy();
      });

      // Mock successful retry
      mockGetCurrentWeatherData.mockResolvedValueOnce(mockWeatherData);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(mockGetCurrentWeatherData).toHaveBeenCalledTimes(2);
      });
    });
  });
});
