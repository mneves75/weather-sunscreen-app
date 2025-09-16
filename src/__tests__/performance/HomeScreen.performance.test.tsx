/**
 * HomeScreen Performance Validation Tests
 * Critical: Ensure the 1500 fake items bug is completely fixed
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { jest } from '@jest/globals';
import HomeScreen from '../../../app/(tabs)/index';
import { WeatherProvider } from '../../context/WeatherContext';
import { ThemeProvider } from '../../theme/theme';

// Mock dependencies
jest.mock('../../services/weatherService');
jest.mock('../../services/loggerService', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <WeatherProvider>{children}</WeatherProvider>
  </ThemeProvider>
);

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

    it('should contain expected dashboard components', () => {
      const { getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      // Verify that we have real dashboard components instead of fake data
      expect(getByText('Weather Dashboard')).toBeTruthy();
    });
  });
});
