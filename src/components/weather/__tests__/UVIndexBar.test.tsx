import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { UVIndexBar } from '../UVIndexBar';

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    LinearGradient: ({ children, ...props }: any) => React.createElement(View, props, children),
    default: ({ children, ...props }: any) => React.createElement(View, props, children),
  };
});

jest.mock('@/src/components/glass', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    GlassView: ({ children, ...props }: any) => React.createElement(View, props, children),
  };
});

jest.mock('@/src/components/ui', () => {
  const React = require('react');
  const { Text: RNText } = require('react-native');
  return {
    Text: ({ children, ...props }: any) => React.createElement(RNText, props, children),
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, defaultValue?: string) => defaultValue ?? '',
    i18n: { language: 'en' },
  }),
}));

jest.mock('@/src/theme', () => {
  const { tokens } = require('@/src/theme/tokens');
  const lightColors = tokens.colors.light;
  return {
    useTheme: () => ({
      isDark: false,
      colors: lightColors,
      theme: { tokens: { colors: lightColors } },
    }),
    useColors: () => lightColors,
    useGlassAvailability: () => ({
      hasLiquidGlass: false,
      canUseGlass: false,
      shouldReduceTransparency: false,
      isIOS: false,
      isAndroid: true,
    }),
  };
});

describe('UVIndexBar', () => {
  it('renders UV value and label', () => {
    const renderResult = render(
      <UVIndexBar value={8} showLabel />
    );

    const tree = renderResult.toJSON();
    const serialized = JSON.stringify(tree);
    expect(serialized).toContain('UV Index');
    expect(serialized).toContain('Very High');

    const progress = renderResult.UNSAFE_getAllByType(View).find(
      (node) => node.props?.accessibilityRole === 'progressbar'
    );
    expect(progress).toBeDefined();
  });

  it('renders compact variant without container chrome', () => {
    const renderResult = render(
      <UVIndexBar value={3} variant="compact" />
    );

    const progress = renderResult.UNSAFE_getAllByType(View).find(
      (node) => node.props?.accessibilityRole === 'progressbar'
    );
    expect(progress?.props?.accessibilityValue?.now).toBe(3);
  });
});
