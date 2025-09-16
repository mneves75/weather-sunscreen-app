import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { useColors } from '../../theme/theme';
import { applyOpacity } from '../../theme/colorUtils';

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
  const colors = useColors();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(Boolean(enabled));
    });

    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      (enabled: boolean) => setReduceMotion(Boolean(enabled)),
    );

    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  const rawVersion =
    Platform.OS === 'ios'
      ? Platform.constants?.osVersion ||
        Platform.constants?.systemVersion ||
        `${Platform.Version ?? ''}`
      : '';
  const iosMajorVersion = Platform.OS === 'ios' ? parseInt(rawVersion.split('.')[0], 10) || 0 : 0;

  const supportsGlass = Platform.OS === 'ios' && iosMajorVersion >= 26 && reduceMotion === false;

  // Map our historical variants to the official GlassView styles.
  // The library gracefully falls back on unsupported platforms.
  const glassStyle: 'regular' | 'clear' =
    variant === 'thin' || variant === 'glass' ? 'clear' : 'regular';

  const fallbackStyle = useMemo(
    () => [
      styles.fallbackBase,
      {
        backgroundColor: applyOpacity(colors.card, 0.9),
        borderColor: applyOpacity(colors.cardBorder, 0.6),
        shadowColor: applyOpacity(colors.border, 0.4),
      },
      style,
    ],
    [colors.card, colors.cardBorder, colors.border, style],
  );

  if (!supportsGlass) {
    return (
      <View testID="liquid-glass-fallback" style={fallbackStyle}>
        {children}
      </View>
    );
  }

  return (
    <GlassView
      testID="liquid-glass-view"
      glassEffectStyle={glassStyle}
      style={[styles.glassBase, { borderColor: applyOpacity(colors.cardBorder, 0.35) }, style]}
    >
      {children}
    </GlassView>
  );
}

export default LiquidGlassWrapper;

const styles = StyleSheet.create({
  glassBase: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  fallbackBase: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
