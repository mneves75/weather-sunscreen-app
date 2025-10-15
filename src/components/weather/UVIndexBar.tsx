/**
 * UV Index bar with Liquid Glass background (iOS 26+) and Apple system colors.
 */

import React, { useMemo } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/src/components/ui';
import { GlassView } from '@/src/components/glass';
import { useTheme, useGlassAvailability } from '@/src/theme';
import { tokens } from '@/src/theme/tokens';
import { calculateUVLevel, getUVBarColor, getUVBarGradient, getUVLevelLabel } from '@/src/utils';
import { useTranslation } from 'react-i18next';

interface UVIndexBarProps {
  value: number;
  max?: number;
  width?: number | string;
  height?: number;
  showLabel?: boolean;
  /** Show UV scale labels (0, 3, 6, 8, 11) below the bar */
  showScale?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'compact';
}

const { spacing, borderRadius } = tokens;

export const UVIndexBar: React.FC<UVIndexBarProps> = ({
  value,
  max = 11,
  width = '100%',
  height = 12,
  showLabel = false,
  showScale = false,
  style,
  variant = 'default',
}) => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const { canUseGlass } = useGlassAvailability();

  const clampedValue = Math.max(0, Math.min(max, value));
  const progress = max === 0 ? 0 : clampedValue / max;
  const progressPercent = `${Math.round(progress * 100)}%`;

  const uvLevel = useMemo(() => calculateUVLevel(clampedValue), [clampedValue]);

  const uvLabel = useMemo(
    () => getUVLevelLabel(uvLevel, i18n.language),
    [uvLevel, i18n.language]
  );

  const gradient = useMemo(() => getUVBarGradient(clampedValue), [clampedValue]);
  const barColor = useMemo(() => getUVBarColor(clampedValue), [clampedValue]);
  const indicatorColor = isDark ? barColor.dark : barColor.light;

  const isCompact = variant === 'compact';

  const containerStyle = useMemo(
    () => [
      styles.container,
      { width } as ViewStyle,
      isCompact && styles.compactContainer,
      style,
    ],
    [width, isCompact, style]
  );

  const trackBackground = isDark
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.08)';

  // UV scale markers: 0 (low), 3 (moderate), 6 (high), 8 (very-high), 11 (extreme)
  // Calculate position as percentage of max value (11)
  const scaleMarkers = useMemo(() => [
    { value: 0, position: (0 / max) * 100 },
    { value: 3, position: (3 / max) * 100 },
    { value: 6, position: (6 / max) * 100 },
    { value: 8, position: (8 / max) * 100 },
    { value: 11, position: (11 / max) * 100 },
  ], [max]);

  const content = (
    <View style={containerStyle}>
      {showLabel && !isCompact && (
        <View style={styles.labelRow} accessibilityElementsHidden>
          <Text variant="caption" style={[styles.label, { color: colors.onSurfaceVariant }]}>
            {t('uv.index', 'UV Index')}
          </Text>
          <Text variant="body2" style={{ color: colors.onSurface }}>
            {clampedValue.toFixed(0)} • {uvLabel}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: trackBackground,
          },
        ]}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max,
          now: clampedValue,
          text: t('uv.index', 'UV Index'),
        }}
        accessibilityHint={t('uv.protection', 'Protection recommended')}
      >
        <View
          style={[
            styles.fillWrapper,
            {
              width: progressPercent,
            },
          ]}
        >
          <LinearGradient
            colors={isDark ? gradient.dark : gradient.light}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          {progress > 0 && (
            <View
              style={[
                styles.indicator,
                {
                  backgroundColor: isDark ? colors.surface : colors.background,
                  borderColor: indicatorColor,
                  shadowColor: indicatorColor,
                },
              ]}
            />
          )}
        </View>
      </View>

      {/* Scale labels showing UV index thresholds (Low→Extreme) */}
      {showScale && !isCompact && (
        <View style={styles.scaleRow}>
          {scaleMarkers.map((marker) => (
            <View
              key={marker.value}
              style={[
                styles.scaleMarker,
                {
                  left: `${marker.position}%`,
                },
              ]}
            >
              <Text
                variant="caption"
                style={[
                  styles.scaleLabel,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                {marker.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (isCompact) {
    return content;
  }

  if (canUseGlass) {
    return (
      <GlassView
        style={[
          styles.glassWrapper,
          { backgroundColor: Platform.OS === 'ios' ? undefined : colors.surface },
        ]}
        glassEffectStyle="regular"
        tintColor={colors.surfaceTint}
      >
        {content}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        styles.solidWrapper,
        {
          backgroundColor: colors.surface,
          shadowOpacity: 0.1,
        },
      ]}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  glassWrapper: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  solidWrapper: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  container: {
    gap: spacing.sm,
  },
  compactContainer: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  track: {
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  fillWrapper: {
    flexGrow: 1,
    height: '100%',
    borderRadius: borderRadius.full,
    overflow: 'visible',
  },
  indicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-end',
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
  },
  // Scale labels row positioned below the UV bar
  scaleRow: {
    position: 'relative',
    width: '100%',
    height: 20,
    marginTop: spacing.xs,
  },
  // Individual scale marker with absolute positioning
  // Position is calculated as percentage from scaleMarkers array
  scaleMarker: {
    position: 'absolute',
    transform: [{ translateX: -6 }], // Center text (approximate 12px width / 2)
  },
  scaleLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});
