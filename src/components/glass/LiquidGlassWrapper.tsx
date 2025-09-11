import React, { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { GlassView } from 'expo-glass-effect';

type Variant = 'regular' | 'prominent' | 'thin' | 'glassProminent' | 'glass';

interface LiquidGlassWrapperProps {
  children: ReactNode;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}

export function LiquidGlassWrapper({
  children,
  variant = 'regular',
  style,
}: LiquidGlassWrapperProps) {
  // Map our historical variants to the official GlassView styles.
  // The library gracefully falls back on unsupported platforms.
  const glassStyle: 'regular' | 'clear' =
    variant === 'thin' || variant === 'glass' ? 'clear' : 'regular';

  return (
    <GlassView glassEffectStyle={glassStyle} style={style}>
      {children}
    </GlassView>
  );
}

export default LiquidGlassWrapper;
