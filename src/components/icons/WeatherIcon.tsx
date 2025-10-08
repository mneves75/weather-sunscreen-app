/**
 * Weather icon component with WMO code mapping
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme';

interface WeatherIconProps {
  wmoCode: number;
  size?: number;
  color?: string;
}

/**
 * Map WMO weather codes to Ionicons
 * WMO codes: https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
 */
function getIconName(wmoCode: number): keyof typeof Ionicons.glyphMap {
  // Clear conditions (0-1)
  if (wmoCode === 0 || wmoCode === 1) return 'sunny-outline';

  // Partly cloudy (2)
  if (wmoCode === 2) return 'partly-sunny-outline';

  // Cloudy (3)
  if (wmoCode === 3) return 'cloudy-outline';

  // Fog (45-48)
  if (wmoCode >= 45 && wmoCode <= 48) return 'cloudy-outline';

  // Drizzle (51-55, 56-57)
  if ((wmoCode >= 51 && wmoCode <= 55) || (wmoCode >= 56 && wmoCode <= 57)) {
    return 'rainy-outline';
  }

  // Rain (61-65, 66-67, 80-82)
  if (
    (wmoCode >= 61 && wmoCode <= 65) ||
    (wmoCode >= 66 && wmoCode <= 67) ||
    (wmoCode >= 80 && wmoCode <= 82)
  ) {
    return 'rainy-outline';
  }

  // Snow (71-75, 77, 85-86)
  if (
    (wmoCode >= 71 && wmoCode <= 75) ||
    wmoCode === 77 ||
    (wmoCode >= 85 && wmoCode <= 86)
  ) {
    return 'snow-outline';
  }

  // Thunderstorm (95-99)
  if (wmoCode >= 95 && wmoCode <= 99) {
    return 'thunderstorm-outline';
  }

  // Default
  return 'help-outline';
}

export function WeatherIcon({ wmoCode, size = 48, color }: WeatherIconProps) {
  const colors = useColors();
  const iconName = getIconName(wmoCode);
  const iconColor = color || colors.text;

  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={size} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
