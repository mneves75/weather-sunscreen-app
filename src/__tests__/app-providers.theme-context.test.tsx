import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AppProviders from '../theme/AppProviders';
import { LiquidGlassWrapper } from '../components/glass/LiquidGlassWrapper';
import { Text } from 'react-native';
import { useSunscreen } from '../context/SunscreenContext';

jest.mock('../services/sunscreenService', () => ({
  SunscreenService: {
    initializeNotifications: jest.fn().mockResolvedValue(true),
    getUserProfile: jest.fn().mockResolvedValue(null),
    getRecentApplications: jest.fn().mockResolvedValue([]),
    checkReapplicationStatus: jest.fn().mockResolvedValue({ isDue: false }),
    logSunscreenApplication: jest.fn().mockResolvedValue({
      id: 'app_test',
      timestamp: new Date().toISOString(),
      spf: 30,
      bodyParts: [],
    }),
    saveUserProfile: jest.fn().mockResolvedValue(undefined),
    cancelReminders: jest.fn().mockResolvedValue(undefined),
    initializeNotificationsAsync: jest.fn(),
  },
}));

describe('AppProviders theme wiring', () => {
  it('provides ThemeContext so useColors works inside children', () => {
    const { getByText } = render(
      <AppProviders>
        <LiquidGlassWrapper>
          <Text>ok</Text>
        </LiquidGlassWrapper>
      </AppProviders>,
    );
    expect(getByText('ok')).toBeTruthy();
  });

  it('provides SunscreenContext for children', async () => {
    const Probe = () => {
      const { applications } = useSunscreen();
      return <Text testID="apps-count">{applications.length}</Text>;
    };

    const { getByTestId } = render(
      <AppProviders>
        <Probe />
      </AppProviders>,
    );

    await waitFor(() => {
      expect(getByTestId('apps-count').props.children).toBe(0);
    });
  });
});
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement(View, null, children),
    // Preserve other exports if needed
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
