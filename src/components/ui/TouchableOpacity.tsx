/**
 * TouchableOpacity Component
 * Wrapper around React Native TouchableOpacity with theme support
 */

import { useColors } from '@/src/theme/theme';
import React from 'react';
import { TouchableOpacity as RNTouchableOpacity, TouchableOpacityProps } from 'react-native';

export function TouchableOpacity(props: TouchableOpacityProps) {
  const colors = useColors();

  return (
    <RNTouchableOpacity
      {...props}
      // Apply default theme-aware styling if not provided
      style={[
        {
          // Default touch feedback colors
          backgroundColor: 'transparent',
        },
        props.style,
      ]}
    >
      {props.children}
    </RNTouchableOpacity>
  );
}
