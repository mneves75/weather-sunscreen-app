// Mock i18n to avoid loading Expo/React bindings in tests
jest.mock('../../i18n', () => ({
  __esModule: true,
  default: { t: (key: string) => key },
}));

import { getWeatherIcon, isClearWeather, getUVExposureLevel } from '../weatherCodeMapping';

describe('weatherCodeMapping utils', () => {
  test('returns correct icon for clear sky', () => {
    expect(getWeatherIcon(0)).toBe('☀️');
  });

  test('detects clear weather codes', () => {
    expect(isClearWeather(0)).toBe(true);
    expect(isClearWeather(1)).toBe(true);
    expect(isClearWeather(2)).toBe(false);
  });

  test('maps UV exposure level by category', () => {
    expect(getUVExposureLevel(0)).toBe('high'); // clear
    expect(getUVExposureLevel(3)).toBe('low'); // overcast
    expect(getUVExposureLevel(2)).toBe('moderate'); // partly cloudy
    expect(getUVExposureLevel(63)).toBe('low'); // rain
  });
});
