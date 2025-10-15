/**
 * WeatherIcon - Cross-platform weather icon component
 *
 * Uses Ionicons (iOS-style) for iOS and MaterialCommunityIcons for Android
 * Maps WMO weather codes to appropriate icon names
 *
 * @see https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
 */

import React from 'react';
import { Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface WeatherIconProps {
  wmoCode: number;
  size?: number;
  color?: string;
}

interface IconMapping {
  ios: React.ComponentProps<typeof Ionicons>['name'];
  android: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

/**
 * Maps WMO weather codes to platform-specific icon names
 * WMO Code ranges:
 * - 0-1: Clear sky
 * - 2-3: Partly cloudy
 * - 45-48: Fog
 * - 51-57: Drizzle
 * - 61-67: Rain
 * - 71-77: Snow
 * - 80-82: Rain showers
 * - 85-86: Snow showers
 * - 95-99: Thunderstorm
 */
function getWeatherIconNames(wmoCode: number): IconMapping {
  // Clear sky
  if (wmoCode === 0 || wmoCode === 1) {
    return {
      ios: 'sunny',
      android: 'weather-sunny',
    };
  }

  // Partly cloudy
  if (wmoCode === 2 || wmoCode === 3) {
    return {
      ios: 'partly-sunny',
      android: 'weather-partly-cloudy',
    };
  }

  // Fog
  if (wmoCode >= 45 && wmoCode <= 48) {
    return {
      ios: 'cloud',
      android: 'weather-fog',
    };
  }

  // Drizzle
  if (wmoCode >= 51 && wmoCode <= 57) {
    return {
      ios: 'rainy-outline',
      android: 'weather-partly-rainy',
    };
  }

  // Rain
  if (wmoCode >= 61 && wmoCode <= 67) {
    return {
      ios: 'rainy',
      android: 'weather-rainy',
    };
  }

  // Snow
  if (wmoCode >= 71 && wmoCode <= 77) {
    return {
      ios: 'snow',
      android: 'weather-snowy',
    };
  }

  // Rain showers
  if (wmoCode >= 80 && wmoCode <= 82) {
    return {
      ios: 'rainy',
      android: 'weather-pouring',
    };
  }

  // Snow showers
  if (wmoCode >= 85 && wmoCode <= 86) {
    return {
      ios: 'snow',
      android: 'weather-snowy-heavy',
    };
  }

  // Thunderstorm
  if (wmoCode >= 95 && wmoCode <= 99) {
    return {
      ios: 'thunderstorm',
      android: 'weather-lightning',
    };
  }

  // Default: sunny
  return {
    ios: 'sunny',
    android: 'weather-sunny',
  };
}

/**
 * Cross-platform weather icon component
 *
 * @example
 * <WeatherIcon wmoCode={61} size={32} color={colors.primary} />
 */
export function WeatherIcon({ wmoCode, size = 24, color }: WeatherIconProps) {
  const iconNames = getWeatherIconNames(wmoCode);

  if (Platform.OS === 'ios') {
    return (
      <Ionicons
        name={iconNames.ios}
        size={size}
        color={color}
      />
    );
  }

  // Android and web
  return (
    <MaterialCommunityIcons
      name={iconNames.android}
      size={size}
      color={color}
    />
  );
}

/**
 * Get precipitation icon based on intensity
 */
export function getPrecipitationIcon(probability: number): IconMapping {
  if (probability >= 80) {
    return {
      ios: 'rainy',
      android: 'weather-pouring',
    };
  }
  if (probability >= 50) {
    return {
      ios: 'rainy-outline',
      android: 'weather-rainy',
    };
  }
  if (probability >= 20) {
    return {
      ios: 'partly-sunny',
      android: 'weather-partly-rainy',
    };
  }
  return {
    ios: 'sunny',
    android: 'weather-sunny',
  };
}

/**
 * Precipitation icon component
 */
interface PrecipitationIconProps {
  probability: number;
  size?: number;
  color?: string;
}

export function PrecipitationIcon({ probability, size = 24, color }: PrecipitationIconProps) {
  const iconNames = getPrecipitationIcon(probability);

  if (Platform.OS === 'ios') {
    return (
      <Ionicons
        name={iconNames.ios}
        size={size}
        color={color}
      />
    );
  }

  return (
    <MaterialCommunityIcons
      name={iconNames.android}
      size={size}
      color={color}
    />
  );
}
