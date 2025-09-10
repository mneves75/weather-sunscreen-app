import React from 'react';
import { Text } from 'react-native';

interface WeatherIconProps {
  size?: number;
  color?: string;
}

export function WeatherIcon({ size = 24, color = '#000' }: WeatherIconProps) {
  return (
    <Text style={{ fontSize: size, color }} accessibilityLabel="Weather" accessibilityRole="image">
      🌤️
    </Text>
  );
}
