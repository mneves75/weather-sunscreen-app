import React from 'react';
import { render } from '@testing-library/react-native';
import AppProviders from '../theme/AppProviders';
import { LiquidGlassWrapper } from '../components/glass/LiquidGlassWrapper';
import { Text } from 'react-native';

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
