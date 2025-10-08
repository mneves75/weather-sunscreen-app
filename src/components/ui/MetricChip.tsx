/**
 * MetricChip Component
 * Compact display for weather metrics with icon, label, and value
 * 
 * Features:
 * - Liquid Glass effect (iOS 26+)
 * - Material Design elevation fallback
 * - Icon + label + value layout
 * - Customizable colors and sizing
 * - Accessibility-friendly
 */

import { useColors, useGlassAvailability } from '@/src/theme';
import { GlassStyle, GlassView } from 'expo-glass-effect';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';

interface MetricChipProps {
  icon: string;
  label: string;
  value: string;
  glassEffectStyle?: GlassStyle;
  tintColor?: string;
  accessibilityLabel?: string;
}

const ChipContent = ({ icon, label, value }: MetricChipProps) => {
  const colors = useColors();
  return (
    <View style={styles.content}>
      <Text style={styles.icon}>{icon}</Text>
      <Text variant="caption" style={[styles.label, { color: colors.onSurfaceVariant }]}>
        {label}
      </Text>
      <Text variant="body2" style={[styles.value, { color: colors.onSurface }]}>
        {value}
      </Text>
    </View>
  );
};

export const MetricChip = memo<MetricChipProps>(({ 
  icon,
  label,
  value,
  glassEffectStyle = 'regular',
  tintColor,
  accessibilityLabel,
}) => {
  const colors = useColors();
  const { canUseGlass } = useGlassAvailability();
  const defaultTintColor = tintColor ?? colors.surfaceTint;
  const defaultAccessibilityLabel = accessibilityLabel || `${label}: ${value}`;

  if (canUseGlass) {
    return (
      <GlassView
        style={styles.glassChip}
        glassEffectStyle={glassEffectStyle}
        tintColor={defaultTintColor}
        accessibilityRole="text"
        accessibilityLabel={defaultAccessibilityLabel}
      >
        <ChipContent icon={icon} label={label} value={value} />
      </GlassView>
    );
  }

  return (
    <View
      style={[styles.solidChip, { backgroundColor: colors.surfaceVariant }]}
      accessibilityRole="text"
      accessibilityLabel={defaultAccessibilityLabel}
    >
      <ChipContent icon={icon} label={label} value={value} />
    </View>
  );
});

MetricChip.displayName = 'MetricChip';

const styles = StyleSheet.create({
  glassChip: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  solidChip: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    textAlign: 'center',
  },
  value: {
    fontWeight: '600',
  },
});

