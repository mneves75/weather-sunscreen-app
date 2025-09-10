import React from 'react';
import { Text } from 'react-native';

interface ProfileIconProps {
  size?: number;
  color?: string;
}

export function ProfileIcon({ size = 24, color = '#000' }: ProfileIconProps) {
  return (
    <Text style={{ fontSize: size, color }} accessibilityLabel="Profile" accessibilityRole="image">
      👤
    </Text>
  );
}
