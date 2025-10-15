/**
 * Single forecast day card component
 *
 * Modernized with:
 * - Staggered entrance animations (50ms delay per item)
 * - Liquid Glass effects (iOS 26+) with accessibility fallbacks
 * - Material Design elevation for Android/iOS < 26
 * - Optimized for FlashList (consistent height ~104px)
 * - Accessibility-friendly labels and roles
 * - Haptic feedback on press
 */

import { Text } from '@/src/components/ui';
import { WeatherIcon } from '@/src/components/ui/WeatherIcon';
import { UVIndexBar } from '@/src/components/weather/UVIndexBar';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useColors, useGlassAvailability } from '@/src/theme';
import { getStaggerDelay } from '@/src/theme/animations';
import { ForecastDay } from '@/src/types';
import { formatShortDate, getRelativeDayLabel } from '@/src/utils';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ForecastDayCardProps {
  day: ForecastDay;
  index: number;
  onPress?: () => void;
  locale?: string;
  formatTemperature?: (value: number) => string;
}

export const ForecastDayCard = React.memo<ForecastDayCardProps>(({
  day,
  index,
  onPress,
  locale = 'en',
  formatTemperature,
}) => {
  const colors = useColors();
  const { canUseGlass } = useGlassAvailability();
  const { t } = useTranslation();
  const { trigger: triggerHaptic } = useHaptics();

  // Check for reduce motion accessibility preference
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );

    return () => subscription?.remove();
  }, []);

  // Staggered entrance animation (50ms delay per item)
  const animatedOpacity = React.useRef(new Animated.Value(0)).current;
  const animatedTranslateY = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (reduceMotion) {
      animatedOpacity.setValue(1);
      animatedTranslateY.setValue(0);
    } else {
      Animated.parallel([
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 400,
          delay: getStaggerDelay(index, 50),
          easing: Easing.bezier(0.4, 0.0, 0.2, 1.0), // Material emphasized
          useNativeDriver: true,
        }),
        Animated.timing(animatedTranslateY, {
          toValue: 0,
          duration: 400,
          delay: getStaggerDelay(index, 50),
          easing: Easing.bezier(0.4, 0.0, 0.2, 1.0),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [index, reduceMotion]);

  const handlePress = () => {
    if (onPress) {
      triggerHaptic('light');
      onPress();
    }
  };
  
  const dayLabel = getRelativeDayLabel(day.date, locale);
  const dateLabel = formatShortDate(day.date, locale);
  const highTemp = formatTemperature ? formatTemperature(day.temperature.max) : `${Math.round(day.temperature.max)}°`;
  const lowTemp = formatTemperature ? formatTemperature(day.temperature.min) : `${Math.round(day.temperature.min)}°`;
  
  {/*
    ACCESSIBILITY LABEL: Build a comprehensive description for screen readers.
    - day.condition?.description: i18n key like "weather.conditions.2" (safely accessed with ?.)
    - t(key): Translates to current language before including in accessibility string
    - ?? 0: Nullish coalesce operator - use 0 if uvIndex.max is null/undefined (cleaner than || 0)

    The order is critical: translate condition first, then pass translated string to main i18n string.
    This ensures screen reader users get natural language (e.g., "Tuesday. Partly cloudy. High 28...")
    instead of raw keys (e.g., "Tuesday. weather.conditions.2. High 28...").
  */}
  const accessibilityLabel = t('forecast.daySummary', {
    defaultValue: '{{day}}. {{condition}}. High {{high}}, Low {{low}}. UV Index {{uv}}',
    day: dayLabel,
    condition: day.condition?.description ? t(day.condition.description) : 'Unknown',
    high: highTemp,
    low: lowTemp,
    uv: day.uvIndex?.max ?? 0,
  });

  // Card content (used in both glass and solid variants)
  const cardContent = (
    <>
      <View style={styles.dateContainer}>
        <Text variant="body1" style={{ color: colors.onSurface }}>
          {dayLabel}
        </Text>
        <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
          {dateLabel}
        </Text>
      </View>
      
      <View style={styles.conditionContainer}>
        <WeatherIcon
          wmoCode={day.condition.wmoCode || 0}
          size={32}
          color={colors.secondary}
        />
        <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
          {day.condition.main}
        </Text>
      </View>
      
      <View style={styles.temperatureContainer}>
        <Text variant="body1" style={{ color: colors.primary }}>
          {highTemp}
        </Text>
        <Text variant="body2" style={{ color: colors.onSurfaceVariant }}>
          {lowTemp}
        </Text>
      </View>
      
      <View style={styles.uvContainer}>
        <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
          {t('forecast.uvLabel', 'UV')}
        </Text>
        <UVIndexBar
          value={day.uvIndex.max}
          height={8}
          variant="compact"
        />
        <Text variant="body2" style={[styles.uvValue, { color: colors.onSurface }]}>
          {day.uvIndex.max}
        </Text>
      </View>
      
      {day.precipitation.probability > 0 && (
        <View style={styles.precipContainer}>
          {Platform.OS === 'ios' ? (
            <Ionicons name="water" size={16} color={colors.primary} />
          ) : (
            <MaterialCommunityIcons name="water" size={16} color={colors.primary} />
          )}
          <Text variant="caption" style={{ color: colors.primary }}>
            {Math.round(day.precipitation.probability)}%
          </Text>
        </View>
      )}
    </>
  );

  const animatedStyle = {
    opacity: animatedOpacity,
    transform: [{ translateY: animatedTranslateY }],
  };

  // Glass effect variant (iOS 26+)
  if (canUseGlass) {
    const GlassContainer = onPress ? TouchableOpacity : View;
    return (
      <Animated.View style={animatedStyle}>
        <GlassContainer
          style={styles.glassWrapper}
          onPress={handlePress}
          accessibilityRole={onPress ? "button" : undefined}
          accessibilityLabel={accessibilityLabel}
        >
          <GlassView
            style={styles.glassCard}
            glassEffectStyle="regular"
            tintColor={colors.surfaceTint}
          >
            {cardContent}
          </GlassView>
        </GlassContainer>
      </Animated.View>
    );
  }

  // Solid Material Design variant (Android, iOS < 26, accessibility)
  const SolidContainer = onPress ? TouchableOpacity : View;
  return (
    <Animated.View style={animatedStyle}>
      <SolidContainer
        style={[styles.solidCard, { backgroundColor: colors.surface }]}
        onPress={handlePress}
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityLabel={accessibilityLabel}
      >
        {cardContent}
      </SolidContainer>
    </Animated.View>
  );
});

ForecastDayCard.displayName = 'ForecastDayCard';

const styles = StyleSheet.create({
  // Glass wrapper (iOS 26+)
  glassWrapper: {
    borderRadius: 20,    // Premium 20px (Apple standard)
    marginVertical: 4,
    overflow: 'hidden',
  },
  glassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  // Solid card (Android, iOS < 26, accessibility)
  solidCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,    // Premium 20px (Apple standard)
    marginVertical: 4,
    gap: 12,
    // Soft shadow (Apple-style)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  // Content sections
  dateContainer: {
    flex: 2,
    gap: 2,
  },
  conditionContainer: {
    flex: 1.5,
    alignItems: 'center',
    gap: 4,
  },
  temperatureContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uvContainer: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 4,
    minWidth: 72,
  },
  uvValue: {
    textAlign: 'center',
  },
  precipContainer: {
    flex: 0.7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
});
