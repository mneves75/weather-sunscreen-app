/**
 * TouchableOpacity Component
 *
 * Pressable-based drop-in that restores the opacity press feedback the name implies.
 * Built on Pressable (not the legacy RN TouchableOpacity) so it composes with the
 * New Architecture, while honoring the `activeOpacity` prop for call-site control.
 */

import React from 'react';
import { Pressable, TouchableOpacityProps } from 'react-native';

export function TouchableOpacity({ activeOpacity = 0.6, style, children, ...props }: TouchableOpacityProps) {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [{ opacity: pressed ? activeOpacity : 1 }, style]}
    >
      {children}
    </Pressable>
  );
}
