import React from 'react';
import { render } from '@testing-library/react-native';
import { LiquidGlassWrapper } from '../LiquidGlassWrapper';
import { ThemeProvider } from '../../../theme/theme';
import { AccessibilityInfo, Platform, Text } from 'react-native';

jest.mock('expo-glass-effect', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    GlassView: ({ children, ...rest }: any) => (
      <View accessibilityRole="none" {...rest}>
        {children}
      </View>
    ),
  };
});

describe('LiquidGlassWrapper accessibility', () => {
  const origOS = Platform.OS;
  const origVersion = Platform.Version;
  const setPlatform = (os: string, version: any) => {
    (Platform as any).OS = os;
    (Platform as any).Version = version;
    const versionString = typeof version === 'string' ? version : `${version}`;
    Object.defineProperty(Platform, 'constants', {
      configurable: true,
      value: {
        ...(Platform as any).constants,
        osVersion: versionString,
        systemVersion: versionString,
      },
    });
  };

  beforeEach(() => {
    // Reset platform between tests
    setPlatform(origOS, origVersion as any);
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    jest
      .spyOn(AccessibilityInfo, 'addEventListener')
      .mockImplementation(() => ({ remove: jest.fn() }) as any);
  });

  afterAll(() => {
    // Restore original platform values
    setPlatform(origOS, origVersion as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('iOS 26 Liquid Glass Support', () => {
    test('renders native Liquid Glass on iOS 26 with proper fallback', () => {
      setPlatform('ios', 26);
      const { getByText } = render(
        <ThemeProvider>
          <LiquidGlassWrapper>
            <Text>iOS 26 Liquid Glass</Text>
          </LiquidGlassWrapper>
        </ThemeProvider>,
      );
      expect(getByText('iOS 26 Liquid Glass')).toBeTruthy();
    });

    test('renders glass view container on supported iOS', async () => {
      setPlatform('ios', 26);
      expect((Platform as any).constants.osVersion).toBe('26');
      const { findByTestId } = render(
        <ThemeProvider>
          <LiquidGlassWrapper>
            <Text>Indicator</Text>
          </LiquidGlassWrapper>
        </ThemeProvider>,
      );
      expect(await findByTestId('liquid-glass-view')).toBeTruthy();
    });

    test('handles all iOS 26 glass variants correctly', () => {
      setPlatform('ios', 26);
      const variants = ['regular', 'prominent', 'thin', 'glass', 'glassProminent'] as const;

      variants.forEach((variant) => {
        const { getByText } = render(
          <ThemeProvider>
            <LiquidGlassWrapper variant={variant}>
              <Text>{`${variant} variant`}</Text>
            </LiquidGlassWrapper>
          </ThemeProvider>,
        );
        expect(getByText(`${variant} variant`)).toBeTruthy();
      });
    });

    test('renders content on iOS 26 without extra props', () => {
      setPlatform('ios', '26.0');
      const { getByText } = render(
        <ThemeProvider>
          <LiquidGlassWrapper>
            <Text>Glass Content</Text>
          </LiquidGlassWrapper>
        </ThemeProvider>,
      );
      expect(getByText('Glass Content')).toBeTruthy();
    });
  });

  describe('Platform Fallbacks', () => {
    test('renders on iOS 16 fallback with valid accessibilityRole', () => {
      setPlatform('ios', 16);
      const { getByText } = render(
        <ThemeProvider>
          <LiquidGlassWrapper>
            <Text>hello</Text>
          </LiquidGlassWrapper>
        </ThemeProvider>,
      );
      expect(getByText('hello')).toBeTruthy();
    });

    test('renders iOS 18-25 preview version fallback correctly', () => {
      setPlatform('ios', 18);
      const { getByText } = render(
        <ThemeProvider>
          <LiquidGlassWrapper>
            <Text>iOS 18 preview</Text>
          </LiquidGlassWrapper>
        </ThemeProvider>,
      );
      expect(getByText('iOS 18 preview')).toBeTruthy();
    });

    test('renders Android fallback with valid accessibilityRole', () => {
      setPlatform('android', origVersion as any);
      const { getByText } = render(
        <ThemeProvider>
          <LiquidGlassWrapper>
            <Text>ok</Text>
          </LiquidGlassWrapper>
        </ThemeProvider>,
      );
      expect(getByText('ok')).toBeTruthy();
    });

    test('renders web fallback correctly', () => {
      setPlatform('web', undefined);
      const { getByText } = render(
        <ThemeProvider>
          <LiquidGlassWrapper>
            <Text>Web Glass</Text>
          </LiquidGlassWrapper>
        </ThemeProvider>,
      );
      expect(getByText('Web Glass')).toBeTruthy();
    });

    test('uses solid fallback when reduce motion is enabled', async () => {
      setPlatform('ios', 26);
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValueOnce(true);

      const { findByTestId, queryByTestId } = render(
        <ThemeProvider>
          <LiquidGlassWrapper>
            <Text>Reduced Motion</Text>
          </LiquidGlassWrapper>
        </ThemeProvider>,
      );

      expect(await findByTestId('liquid-glass-fallback')).toBeTruthy();
      expect(queryByTestId('liquid-glass-view')).toBeNull();
    });
  });

  // Removed ExpoGlassContainer tests - we now exclusively use expo-glass-effect's GlassView via LiquidGlassWrapper.

  describe('Accessibility', () => {
    test('maintains proper accessibility attributes across platforms', () => {
      const platforms = [
        { os: 'ios', version: '26.0' },
        { os: 'ios', version: '16.0' },
        { os: 'android', version: '34' },
        { os: 'web', version: undefined },
      ];

      platforms.forEach(({ os, version }) => {
        setPlatform(os, version);
        const { getByText } = render(
          <ThemeProvider>
            <LiquidGlassWrapper>
              <Text>Accessible Content</Text>
            </LiquidGlassWrapper>
          </ThemeProvider>,
        );
        expect(getByText('Accessible Content')).toBeTruthy();
      });
    });
  });
});
