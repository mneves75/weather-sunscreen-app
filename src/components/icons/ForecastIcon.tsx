import React from 'react';
import { Text } from 'react-native';

interface ForecastIconProps {
  size?: number;
  color?: string;
}

export function ForecastIcon({ size = 24, color = '#000' }: ForecastIconProps) {
  return (
    <Text style={{ fontSize: size, color }} accessibilityLabel="Forecast" accessibilityRole="image">
      📅
    </Text>
  );
}
