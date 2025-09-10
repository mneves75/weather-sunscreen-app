import React from 'react';
import { Text } from 'react-native';

interface SunscreenIconProps {
  size?: number;
  color?: string;
}

export function SunscreenIcon({ size = 24, color = '#000' }: SunscreenIconProps) {
  return (
    <Text
      style={{ fontSize: size, color }}
      accessibilityLabel="Sunscreen Tracker"
      accessibilityRole="image"
    >
      🧴
    </Text>
  );
}
