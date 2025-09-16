import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeProvider, useTheme } from '../theme';

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __store: store,
    setItem: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    getItem: jest.fn(async (key: string) => store.get(key) ?? null),
    removeItem: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    multiRemove: jest.fn(async (keys: string[]) => {
      keys.forEach((key) => store.delete(key));
    }),
  };
});

jest.mock('../../services/loggerService', () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

function ThemeProbe() {
  const { themeMode, highContrast, toggleTheme, setHighContrast } = useTheme();
  return (
    <>
      <Text testID="mode">{themeMode}</Text>
      <Text testID="contrast">{String(highContrast)}</Text>
      <Text accessibilityRole="button" testID="toggle" onPress={toggleTheme}>
        toggle
      </Text>
      <Text
        accessibilityRole="button"
        testID="contrast-toggle"
        onPress={() => setHighContrast(!highContrast)}
      >
        contrast
      </Text>
    </>
  );
}

describe('ThemeProvider persistence', () => {
  const storage = AsyncStorage as unknown as {
    __store: Map<string, string>;
    setItem: jest.Mock;
    getItem: jest.Mock;
  };

  beforeEach(() => {
    storage.__store.clear();
    storage.setItem.mockClear();
    storage.getItem.mockClear();
  });

  it('restores persisted theme mode and high contrast', async () => {
    storage.__store.set('@WeatherSunscreen:themeMode', 'dark');
    storage.__store.set('@WeatherSunscreen:themeHighContrast', '1');

    const { findByTestId } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await waitFor(async () => {
      expect((await findByTestId('mode')).props.children).toBe('dark');
      expect((await findByTestId('contrast')).props.children).toBe('true');
    });
  });

  it('persists updates when toggling mode and high contrast', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    fireEvent.press(getByTestId('toggle'));
    fireEvent.press(getByTestId('toggle'));
    fireEvent.press(getByTestId('contrast-toggle'));

    await waitFor(() => {
      expect(storage.setItem).toHaveBeenCalledWith('@WeatherSunscreen:themeMode', 'dark');
      expect(storage.setItem).toHaveBeenCalledWith('@WeatherSunscreen:themeHighContrast', '1');
    });
  });
});
