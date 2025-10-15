import React from 'react';
import { render } from '@testing-library/react-native';
import { DaylightArc } from '../DaylightArc';
import { formatTimeShort } from '@/src/utils/daylight';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, number>) => {
      if (key === 'daylight.accessibilityArc') {
        const hours = options?.hours ?? 0;
        const minutes = options?.minutes ?? 0;
        return `Daylight arc showing ${hours} hours and ${minutes} minutes of sunlight`;
      }
      const mapping: Record<string, string> = {
        'daylight.solarNoon': 'Solar noon',
        'daylight.peakUV': 'Peak UV',
        'daylight.duration': 'Daylight',
        'daylight.sunrise': 'Sunrise',
        'daylight.sunset': 'Sunset',
      };
      return mapping[key] ?? key;
    },
    i18n: { language: 'en' },
  }),
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const create = (props: any) => React.createElement(View, props, props.children);
  return {
    __esModule: true,
    default: create,
    Path: create,
    Circle: create,
    Defs: create,
    Stop: create,
    LinearGradient: create,
  };
});

jest.mock('@/src/components/ui', () => {
  const React = require('react');
  const { Text: RNText } = require('react-native');
  return {
    Text: ({ children, ...props }: any) => React.createElement(RNText, props, children),
  };
});

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

describe('DaylightArc', () => {
  const sunrise = '2025-07-01T05:30:00-04:00';
  const sunset = '2025-07-01T20:15:00-04:00';
  const solarNoon = '2025-07-01T12:52:30-04:00';

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders sunrise and sunset times', () => {
    const { getAllByText, getByText } = render(
      <DaylightArc
        sunrise={sunrise}
        sunset={sunset}
        solarNoon={solarNoon}
        daylightDurationMinutes={885}
        peakUV={9}
      />
    );

    expect(getAllByText(formatTimeShort(sunrise)).length).toBeGreaterThan(0);
    expect(getAllByText(formatTimeShort(sunset)).length).toBeGreaterThan(0);
    expect(getByText('Solar noon')).toBeTruthy();
    expect(getByText('9 • Very High')).toBeTruthy();
  });

  it('exposes accessibility label for daylight description', () => {
    const { getByLabelText } = render(
      <DaylightArc
        sunrise={sunrise}
        sunset={sunset}
        solarNoon={solarNoon}
        daylightDurationMinutes={885}
      />
    );

    expect(getByLabelText('Daylight arc showing 14 hours and 45 minutes of sunlight')).toBeTruthy();
  });
});
