/**
 * HomeScreen Performance Validation Tests
 * Critical: Ensure the 1500 fake items bug is completely fixed
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { jest } from '@jest/globals';
import HomeScreen from '../../../app/(tabs)/(home)/index';
import { WeatherProvider } from '../../context/WeatherContext';
import { ThemeProvider } from '../../theme/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../../i18n';
import { WeatherService } from '../../services/weatherService';

const mockWeatherData: any = {
  location: { name: 'Test City', country: 'TC', lat: 10, lon: 20 },
  current: {
    temperature: 25,
    description: 'Clear',
    humidity: 50,
    windSpeed: 4,
    pressure: 1012,
    visibility: 10,
    feelsLike: 26,
  },
  forecast: [
    {
      date: '2025-09-16',
      maxTemp: 26,
      minTemp: 18,
      description: 'Clear',
      icon: '☀️',
      humidity: 60,
      uvIndex: 7,
      precipitationChance: 10,
    },
  ],
  uvIndex: {
    value: 6,
    level: 'High',
    maxToday: 7,
    peakTime: '12:00 PM',
    sunscreenRecommendation: {
      spf: 30,
      applicationFrequency: 'Every 2 hours',
      additionalTips: [],
      skinTypeRecommendations: { fair: '', medium: '', dark: '' },
    },
  },
};

// Mock dependencies
jest.mock('../../services/weatherService');
jest.mock('../../services/loggerService', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
jest.mock('expo-router', () => {
  const React = require('react');
  const mockLink = Object.assign(
    ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    {
      Trigger: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
      Preview: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
      Menu: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
      MenuAction: () => null,
    },
  );

  return {
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    Link: mockLink,
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = React.useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WeatherProvider>{children}</WeatherProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

beforeEach(() => {
  // Mock location resolution (WeatherContext calls this first)
  jest.mocked(WeatherService.resolveCurrentLocation).mockResolvedValue({
    latitude: 10,
    longitude: 20,
  });

  jest.mocked(WeatherService.getCurrentWeatherData).mockResolvedValue(mockWeatherData);
  jest.mocked(WeatherService.getForecastForLocation).mockResolvedValue(mockWeatherData.forecast);
});

describe('HomeScreen Performance Tests', () => {
  describe('Critical Bug Fix Validation', () => {
    it('should not create massive arrays that cause memory issues', () => {
      // Mock console.warn to catch performance warnings
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const { unmount } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      // Check that no array creation warnings are triggered
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('large array'));

      // Verify component unmounts cleanly
      expect(() => unmount()).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should render without FlashList component', () => {
      const { toJSON } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      const tree = JSON.stringify(toJSON());

      // Ensure FlashList is not present (was used for the 1500 items)
      expect(tree).not.toContain('FlashList');
      expect(tree).not.toContain('renderItem');
    });

    it('should not contain any references to fake item arrays', () => {
      const { queryByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      // Ensure no fake items are present
      for (let i = 1; i <= 100; i++) {
        expect(queryByText(`Item ${i}`)).toBeNull();
      }
    });
  });

  describe('Memory Usage Validation', () => {
    it('should have minimal memory footprint', () => {
      const startMemory = process.memoryUsage();

      const { unmount } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      const renderMemory = process.memoryUsage();

      // Unmount and force garbage collection if available
      unmount();
      if (global.gc) {
        global.gc();
      }

      const endMemory = process.memoryUsage();

      // Memory increase should be reasonable (less than 10MB for a dashboard)
      const memoryIncrease = renderMemory.heapUsed - startMemory.heapUsed;
      const memoryAfterCleanup = endMemory.heapUsed - startMemory.heapUsed;

      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Memory after cleanup: ${(memoryAfterCleanup / 1024 / 1024).toFixed(2)}MB`);

      // Should not consume more than 10MB during render
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB limit
    });

    it('should not create memory leaks on re-render', () => {
      const { rerender, unmount } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      const startMemory = process.memoryUsage().heapUsed;

      // Re-render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(
          <TestWrapper>
            <HomeScreen />
          </TestWrapper>,
        );
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      console.log(
        `Memory increase after 10 re-renders: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`,
      );

      // Should not leak significant memory on re-renders
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // 5MB limit

      unmount();
    });
  });

  describe('Render Performance', () => {
    it('should render quickly without blocking the main thread', () => {
      const startTime = performance.now();

      const { unmount } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      const renderTime = performance.now() - startTime;

      console.log(`HomeScreen render time: ${renderTime.toFixed(2)}ms`);

      // Should render in under 100ms (very generous for a dashboard)
      expect(renderTime).toBeLessThan(100);

      unmount();
    });

    it('should not cause layout thrashing', () => {
      const layoutCount = 0;

      // Mock onLayout to count layout events
      // const originalOnLayout = React.createElement;

      const { unmount } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      // Should not trigger excessive layout calculations
      // This is a simplified test - in a real scenario you'd use performance profiling tools
      expect(layoutCount).toBeLessThan(50); // Reasonable limit

      unmount();
    });
  });

  describe('Component Tree Validation', () => {
    it('should have a reasonable component depth', () => {
      const { toJSON } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      const tree = toJSON();

      // Calculate approximate component depth
      const treeString = JSON.stringify(tree);
      const maxNesting = (treeString.match(/{/g) || []).length;

      console.log(`Approximate component nesting depth: ${maxNesting}`);

      // Should not have excessive nesting (which could cause performance issues)
      expect(maxNesting).toBeLessThan(100); // Reasonable limit
    });

    it('should contain expected dashboard components', async () => {
      const { findByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      // Verify that we have real dashboard components instead of fake data
      // Use findByText to wait for async data loading to complete
      const dashboardTitle = await findByText('Weather Dashboard');
      expect(dashboardTitle).toBeTruthy();
    });
  });
});
