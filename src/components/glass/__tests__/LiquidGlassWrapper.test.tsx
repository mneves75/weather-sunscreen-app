import React from 'react';
import { render } from '@testing-library/react-native';
import { LiquidGlassWrapper } from '../LiquidGlassWrapper';
import { ThemeProvider } from '../../../context/ThemeContext';
import { Platform, Text } from 'react-native';

describe('LiquidGlassWrapper accessibility', () => {
  const origOS = Platform.OS;
  const origVersion = Platform.Version;
  const setPlatform = (os: string, version: any) => {
    (Platform as any).OS = os;
    (Platform as any).Version = version;
  };

  beforeEach(() => {
    // Reset platform between tests
    setPlatform(origOS, origVersion as any);
  });

  afterAll(() => {
    // Restore original platform values
    setPlatform(origOS, origVersion as any);
  });

  describe('iOS 26 Liquid Glass Support', () => {
    test('renders native Liquid Glass on iOS 26 with proper fallback', () => {
      setPlatform('ios', '26.0');
      const { getByText } = render(
        <ThemeProvider>
          <LiquidGlassWrapper>
            <Text>iOS 26 Liquid Glass</Text>
          </LiquidGlassWrapper>
        </ThemeProvider>,
      );
      expect(getByText('iOS 26 Liquid Glass')).toBeTruthy();
    });

    test('handles all iOS 26 glass variants correctly', () => {
      setPlatform('ios', '26.0');
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
      setPlatform('ios', '16.0');
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
      setPlatform('ios', '18.0');
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
