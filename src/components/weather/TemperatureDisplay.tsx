/**
 * Hero Temperature Display
 * Dramatic large-format temperature with glass effect
 *
 * Design principles:
 * - Ultralight font weight (200) for elegance
 * - Large size (76px) for hero prominence
 * - Tight letter-spacing (-1.5) for refinement
 * - Dynamic glass tinting based on weather
 * - Spring entrance animation
 *
 * @example
 * ```typescript
 * <TemperatureDisplay
 *   temperature={24}
 *   unit="C"
 *   condition="Partly Cloudy"
 *   weatherType="cloudy"
 * />
 * ```
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GlassView } from '@/src/components/glass';
import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import { tokens } from '@/src/theme/tokens';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

const { spacing, borderRadius } = tokens;

export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'default';

export interface TemperatureDisplayProps {
  /** Temperature value */
  temperature: number;
  /** Temperature unit */
  unit: 'C' | 'F';
  /** Weather condition text */
  condition: string;
  /** Weather type for dynamic glass tinting */
  weatherType?: WeatherType;
}

export function TemperatureDisplay({
  temperature,
  unit,
  condition,
  weatherType = 'default',
}: TemperatureDisplayProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  // Entrance animation (bouncy spring)
  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 12,
      mass: 1,
      stiffness: 100,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    });

    opacity.value = withSpring(1, {
      damping: 15,
      mass: 1,
      stiffness: 120,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Dynamic glass tinting based on weather type
  const glassTint = getWeatherTint(weatherType);

  // Accessibility label with translations
  const unitLabel = unit === 'C'
    ? t('accessibility.temperatureDisplay.celsius')
    : t('accessibility.temperatureDisplay.fahrenheit');
  const accessibilityLabel = t('accessibility.temperatureDisplay.label', {
    temperature,
    unit: unitLabel,
    condition,
  });

  return (
    <GlassView
      glassEffectStyle="clear"
      elevation={5}
      tintColor={glassTint}
      style={styles.container}
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[styles.content, animatedStyle]}>
        {/* Hero temperature */}
        <Text style={[styles.temperature, { color: colors.text }]}>
          {temperature}°
        </Text>

        {/* Condition */}
        <Text style={[styles.condition, { color: colors.textSecondary }]}>
          {condition}
        </Text>
      </Animated.View>
    </GlassView>
  );
}

/**
 * Get glass tint color based on weather type
 */
function getWeatherTint(weatherType: WeatherType): string {
  const tintMap: Record<WeatherType, string> = {
    sunny: 'rgba(0, 122, 255, 0.08)',       // Blue tint
    rainy: 'rgba(84, 84, 88, 0.12)',        // Gray tint
    cloudy: 'rgba(142, 142, 147, 0.10)',    // Light gray tint
    snowy: 'rgba(10, 132, 255, 0.06)',      // Light blue tint
    default: 'rgba(0, 122, 255, 0.06)',     // Default blue tint
  };

  return tintMap[weatherType];
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  temperature: {
    fontSize: 76,
    fontWeight: '200',      // Ultralight for elegance
    letterSpacing: -1.5,    // Tighter for large sizes
    lineHeight: 84,         // 1.1 ratio
    textAlign: 'center',
  },
  condition: {
    fontSize: 22,
    fontWeight: '300',      // Light
    marginTop: spacing.sm,
    opacity: 0.8,
    textAlign: 'center',
  },
});
