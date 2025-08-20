import React from 'react';
import { Text } from 'react-native';

interface UVIconProps {
  size?: number;
  color?: string;
}

export function UVIcon({ size = 24, color = '#000' }: UVIconProps) {
  return (
    <Text style={{ fontSize: size, color }}>
      ☀️
    </Text>
  );
}