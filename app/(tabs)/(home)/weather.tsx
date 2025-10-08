/**
 * Weather Detail Screen
 * Detailed weather information display
 *
 * Modernized with:
 * - Parallax header with animated weather gradient
 * - Staggered chip animations (30ms delay)
 * - Haptic feedback on interactions
 * - Sticky glass header with location
 * - Segmented glass sections for organized data
 * - Material Design elevation fallbacks
 */

import { Container, ErrorView, LoadingSpinner, Text } from '@/src/components/ui';
import { LocationDisplay, TemperatureDisplay, WeatherCard, WeatherDetails, WeatherGradient, type WeatherType } from '@/src/components/weather';
import { useSettings } from '@/src/context/SettingsContext';
import { useWeatherData } from '@/src/hooks';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useColors, useGlassAvailability } from '@/src/theme';
import { getStaggerDelay } from '@/src/theme/animations';
import { tokens } from '@/src/theme/tokens';
import { GlassView } from 'expo-glass-effect';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Animated, Easing, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

const { spacing, borderRadius } = tokens;

// Animated Metric Chip Component
interface AnimatedMetricChipProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  index: number;
  canUseGlass: boolean;
  colors: any;
  reduceMotion: boolean;
  onPress?: () => void;
}

function AnimatedMetricChip({
  label,
  value,
  icon,
  index,
  canUseGlass,
  colors,
  reduceMotion,
  onPress,
}: AnimatedMetricChipProps) {
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const animatedScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (reduceMotion) {
      animatedOpacity.setValue(1);
      animatedScale.setValue(1);
    } else {
      Animated.parallel([
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 400,
          delay: getStaggerDelay(index, 30),
          easing: Easing.bezier(0.4, 0.0, 0.2, 1.0),
          useNativeDriver: true,
        }),
        Animated.spring(animatedScale, {
          toValue: 1,
          delay: getStaggerDelay(index, 30),
          damping: 12,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [index, reduceMotion]);

  const animatedStyle = {
    opacity: animatedOpacity,
    transform: [{ scale: animatedScale }],
  };

  const chipContent = (
    <>
      <View style={styles.chipIcon}>{icon}</View>
      <Text variant="caption" style={[styles.chipLabel, { color: colors.onSurfaceVariant }]}>
        {label}
      </Text>
      <Text variant="body2" style={[styles.chipValue, { color: colors.onSurface }]}>
        {value}
      </Text>
    </>
  );

  if (canUseGlass) {
    return (
      <Animated.View style={[styles.chipGlass, animatedStyle]}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <GlassView
            style={styles.chipContent}
            glassEffectStyle="regular"
          >
            {chipContent}
          </GlassView>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.chipSolid, animatedStyle, { backgroundColor: colors.surfaceVariant }]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.chipContent,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        {chipContent}
      </Pressable>
    </Animated.View>
  );
}

export default function WeatherDetailScreen() {
  const colors = useColors();
  const { canUseGlass } = useGlassAvailability();
  const { preferences } = useSettings();
  const use24HourTime = preferences.timeFormat === '24h' || (preferences.timeFormat === 'system' && preferences.locale === 'pt-BR');
  const { t } = useTranslation();
  const { trigger: triggerHaptic } = useHaptics();

  // Parallax scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;

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
  
  const { 
    weatherData, 
    isLoading, 
    error, 
    refresh,
    speedUnit,
    pressureUnit,
    temperatureUnit,
    getTemperatureWithUnit,
    formatWindSpeed,
    formatPressure,
  } = useWeatherData();
  
  // Show loading on first load
  if (isLoading && !weatherData) {
    return (
      <Container style={styles.centerContainer}>
        <LoadingSpinner message={t('common.loading')} />
      </Container>
    );
  }

  // Show error if data failed to load
  if (error && !weatherData) {
    return (
      <Container style={styles.centerContainer}>
        <ErrorView
          message={t('errors.weatherData')}
          onRetry={refresh}
        />
      </Container>
    );
  }

  if (!weatherData) {
    return (
      <Container style={styles.centerContainer}>
        <ErrorView
          message={t('errors.weatherData')}
          onRetry={refresh}
        />
      </Container>
    );
  }

  // Helper: Determine weather type for gradient/tinting
  const getWeatherType = (condition: string): WeatherType => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return 'sunny';
    if (lowerCondition.includes('rain') || lowerCondition.includes('storm')) return 'rainy';
    if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) return 'cloudy';
    if (lowerCondition.includes('snow') || lowerCondition.includes('ice')) return 'snowy';
    return 'default';
  };

  // Parallax header animation
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150, 200],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Metric chip data for quick insights
  const metricChips = [
    {
      label: t('weather.feelsLike', 'Feels Like'),
      value: getTemperatureWithUnit(weatherData.current.feelsLike),
      icon: <Feather name="thermometer" size={20} color={colors.primary} />,
    },
    {
      label: t('weather.humidity', 'Humidity'),
      value: `${weatherData.current.humidity}%`,
      icon: <Feather name="droplet" size={20} color={colors.primary} />,
    },
    {
      label: t('weather.wind', 'Wind'),
      value: formatWindSpeed(weatherData.current.windSpeed),
      icon: <Feather name="wind" size={20} color={colors.primary} />,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Parallax Header with Weather Gradient */}
      <Animated.View
        style={[
          styles.parallaxHeader,
          {
            transform: reduceMotion ? [] : [
              { translateY: headerTranslateY },
              { scale: headerScale },
            ],
            opacity: reduceMotion ? 1 : headerOpacity,
          },
        ]}
      >
        <WeatherGradient weatherType={getWeatherType(weatherData.current.condition.description)}>
          <View style={styles.headerContent}>
            {weatherData.location && (
              <View style={styles.locationWrapper}>
                <LocationDisplay
                  location={weatherData.location}
                  showCoordinates
                />
              </View>
            )}
            <TemperatureDisplay
              temperature={weatherData.current.temperature}
              unit={preferences.temperatureUnit === 'celsius' ? 'C' : 'F'}
              condition={weatherData.current.condition.description}
              weatherType={getWeatherType(weatherData.current.condition.description)}
            />
          </View>
        </WeatherGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >

      {/* Metric Chips Row with Staggered Animations */}
      <View style={styles.chipRow}>
        {metricChips.map((chip, index) => (
          <AnimatedMetricChip
            key={chip.label}
            label={chip.label}
            value={chip.value}
            icon={chip.icon}
            index={index}
            canUseGlass={canUseGlass}
            colors={colors}
            reduceMotion={reduceMotion}
            onPress={() => triggerHaptic('light')}
          />
        ))}
      </View>
      
      {/* Detailed Information Section with Glass */}
      {canUseGlass ? (
        <GlassView
          style={styles.detailsCard}
          glassEffectStyle="regular"
          tintColor={colors.surfaceTint}
        >
          <WeatherDetails
            data={weatherData}
            locale={preferences.locale}
            speedUnit={speedUnit}
            pressureUnit={pressureUnit}
            temperatureUnit={temperatureUnit}
          />
        </GlassView>
      ) : (
        <View style={[styles.detailsCard, styles.solidCard, { backgroundColor: colors.surface }]}>
          <WeatherDetails
            data={weatherData}
            locale={preferences.locale}
            speedUnit={speedUnit}
            pressureUnit={pressureUnit}
            temperatureUnit={temperatureUnit}
          />
        </View>
      )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  parallaxHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    minHeight: 300,
  },
  headerContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    minHeight: 300,
    justifyContent: 'center',
  },
  locationWrapper: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 320, // Account for parallax header
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  // Solid fallback card styles
  solidCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Metric chips row
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chipGlass: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  chipSolid: {
    flex: 1,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  chipContent: {
    padding: spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  chipIcon: {
    marginBottom: 4,
  },
  chipLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  chipValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Details section
  detailsCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
});
