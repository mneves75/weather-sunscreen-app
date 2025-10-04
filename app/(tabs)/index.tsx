/**
 * Home/Dashboard Screen
 * Main screen showing weather summary, UV index, and quick actions
 * 
 * Modernized with:
 * - Liquid Glass effects (iOS 26+) with accessibility fallbacks
 * - Performance-optimized with StyleSheet.create
 * - Accessibility labels and roles
 * - Platform-adaptive design (iOS Glass + Android Material)
 */

import { Button, Container, ErrorView, LoadingSpinner, Text } from '@/src/components/ui';
import {
    LocationDisplay,
    SunscreenTracker,
    UVIndicator,
    UVRecommendations,
    WeatherCard,
} from '@/src/components/weather';
import { useSettings } from '@/src/context/SettingsContext';
import { LocationError, useForecast, useLocation, useUVIndex, useWeatherData } from '@/src/hooks';
import { useColors, useGlassAvailability } from '@/src/theme';
import { tokens } from '@/src/theme/tokens';
import { createFadeInComponent, createSlideUpComponent } from '@/src/theme/animations';
import { GlassView } from 'expo-glass-effect';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Alert, Animated, Linking, Platform, RefreshControl, ScrollView, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

const { spacing, borderRadius } = tokens;

export default function HomeScreen() {
  const colors = useColors();
  const { canUseGlass } = useGlassAvailability();
  const router = useRouter();
  const { preferences } = useSettings();
  const { t } = useTranslation();
  const use24HourTime = preferences.timeFormat === '24h' || (preferences.timeFormat === 'system' && preferences.locale === 'pt-BR');

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

  // Entrance animations - Snappier timings for better UX
  const weatherCardAnim = createSlideUpComponent(50, 50);
  const uvCardAnim = createSlideUpComponent(50, 100);
  const actionsAnim = createFadeInComponent(150);
  
  // Get weather data
  const { 
    weatherData, 
    isLoading: isLoadingWeather, 
    error: weatherError, 
    refresh: refreshWeather,
    getTemperatureWithUnit,
    formatWindSpeed,
    formatPressure,
  } = useWeatherData();
  
  // Get forecast data
  const {
    days,
    isLoading: isLoadingForecast,
    error: forecastError,
    refresh: refreshForecast,
    getTemperatureWithUnit: getForecastTempWithUnit,
  } = useForecast();
  
  // Get UV index data
  const {
    uvIndex,
    spfRecommendation,
    recommendations,
    isLoading: isLoadingUV,
    error: uvError,
    refresh: refreshUV,
  } = useUVIndex();
  
  // Get location
  const {
    currentLocation,
    permissionStatus,
    isRequesting,
    getCurrentLocation,
  } = useLocation();

  const showPermissionDeniedAlert = useCallback(() => {
    Alert.alert(
      t('location.permissionDenied'),
      t('location.permissionDeniedMessage'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('location.openSettings'),
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  }, [t]);

  const showServicesDisabledAlert = useCallback(() => {
    Alert.alert(
      t('location.servicesDisabled'),
      t('location.servicesDisabledMessage'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('location.openSettings'),
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  }, [t]);

  const requestLocationWithHandling = useCallback(async (promptForServices: boolean) => {
    if (permissionStatus === 'denied') {
      showPermissionDeniedAlert();
      return false;
    }

    try {
      await getCurrentLocation({ promptForServices });
      return true;
    } catch (err) {
      if (err instanceof LocationError) {
        if (err.code === 'permission-denied') {
          showPermissionDeniedAlert();
          return false;
        }

        if (err.code === 'services-disabled') {
          showServicesDisabledAlert();
          return false;
        }
      }

      Alert.alert(
        t('location.error'),
        t('location.errorMessage'),
        [{ text: 'OK' }]
      );
      return false;
    }
  }, [permissionStatus, getCurrentLocation, showPermissionDeniedAlert, showServicesDisabledAlert, t]);
  
  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refreshWeather(),
      refreshForecast(),
      refreshUV(),
    ]);
  }, [refreshWeather, refreshForecast, refreshUV]);
  
  // Handle location request
  const handleLocationRequest = useCallback(async () => {
    await requestLocationWithHandling(true);
  }, [requestLocationWithHandling]);

  const handleRefreshPress = useCallback(async () => {
    await requestLocationWithHandling(true);
    await handleRefresh();
  }, [requestLocationWithHandling, handleRefresh]);

  // Trigger entrance animations when data loads (respect reduce motion)
  useEffect(() => {
    if (weatherData) {
      if (reduceMotion) {
        weatherCardAnim.opacity.setValue(1);
        weatherCardAnim.translateY.setValue(0);
      } else {
        weatherCardAnim.animate();
      }
    }
  }, [weatherData, reduceMotion]);

  useEffect(() => {
    if (uvIndex) {
      if (reduceMotion) {
        uvCardAnim.opacity.setValue(1);
        uvCardAnim.translateY.setValue(0);
      } else {
        uvCardAnim.animate();
      }
    }
  }, [uvIndex, reduceMotion]);

  useEffect(() => {
    if (weatherData && uvIndex) {
      if (reduceMotion) {
        actionsAnim.opacity.setValue(1);
      } else {
        actionsAnim.animate();
      }
    }
  }, [weatherData, uvIndex, reduceMotion]);
  
  const isLoading = isLoadingWeather || isLoadingForecast || isLoadingUV;
  const hasError = weatherError || forecastError || uvError;
  
  // Show loading on first load
  if (isLoading && !weatherData && !uvIndex) {
    return (
      <Container style={styles.centerContainer}>
        <LoadingSpinner message={t('common.loading')} />
      </Container>
    );
  }

  // Show location request if no location
  if (!currentLocation && !isRequesting) {
    return (
      <Container style={styles.centerContainer}>
        <Text variant="h2" style={[styles.title, { color: colors.onBackground }]}>
          {t('location.welcome')}
        </Text>
        <Text variant="body1" style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          {t('location.welcomeMessage')}
        </Text>
        <Button
          title={t('location.allowLocation')}
          onPress={handleLocationRequest}
          style={styles.button}
        />
      </Container>
    );
  }

  // Show error if data failed to load
  if (hasError && !weatherData) {
    return (
      <Container style={styles.centerContainer}>
        <ErrorView
          message={t('errors.weatherData')}
          onRetry={handleRefresh}
        />
      </Container>
    );
  }
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Location Display */}
      {weatherData?.location && (
        <View style={styles.locationHeader}>
          <TouchableOpacity
            onPress={handleRefreshPress}
            accessibilityRole="button"
            accessibilityLabel={t('home.refreshWeather')}
            disabled={isRequesting || isLoading}
            style={[
              styles.refreshIconButton,
              { backgroundColor: colors.surfaceVariant },
              (isRequesting || isLoading) && styles.refreshIconButtonDisabled,
            ]}
            activeOpacity={0.7}
          >
            {isRequesting || isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Feather name="refresh-ccw" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          <View style={styles.locationDisplayWrapper}>
            <LocationDisplay
              location={weatherData.location}
              onPress={() => router.push('/(tabs)/(home)/weather')}
            />
          </View>
        </View>
      )}
      
      {/* Weather Card with Glass Effect and Animation */}
      {weatherData && (
        <Animated.View
          style={{
            opacity: weatherCardAnim.opacity,
            transform: [{ translateY: weatherCardAnim.translateY }],
          }}
        >
          {canUseGlass ? (
            <GlassView
              style={styles.glassCard}
              glassEffectStyle="regular"
              tintColor={colors.surfaceTint}
              accessibilityRole="button"
              accessibilityLabel={`Current weather: ${weatherData.current.temperature} degrees, ${weatherData.current.condition.description}`}
              accessibilityHint={t('accessibility.weatherCard.hint', 'Double tap to view detailed weather information')}
            >
              <WeatherCard
                data={weatherData}
                onPress={() => router.push('/(tabs)/(home)/weather')}
                temperatureText={getTemperatureWithUnit(weatherData.current.temperature)}
                feelsLikeText={getTemperatureWithUnit(weatherData.current.feelsLike)}
                windText={formatWindSpeed(weatherData.current.windSpeed)}
                pressureText={formatPressure(weatherData.current.pressure)}
                humidityText={`${weatherData.current.humidity}%`}
                locale={preferences.locale}
                use24HourTime={use24HourTime}
              />
            </GlassView>
          ) : (
            <View
              style={[styles.solidCard, { backgroundColor: colors.surface }]}
              accessibilityRole="button"
              accessibilityLabel={`Current weather: ${weatherData.current.temperature} degrees, ${weatherData.current.condition.description}`}
              accessibilityHint={t('accessibility.weatherCard.hint', 'Double tap to view detailed weather information')}
            >
              <WeatherCard
                data={weatherData}
                onPress={() => router.push('/(tabs)/(home)/weather')}
                temperatureText={getTemperatureWithUnit(weatherData.current.temperature)}
                feelsLikeText={getTemperatureWithUnit(weatherData.current.feelsLike)}
                windText={formatWindSpeed(weatherData.current.windSpeed)}
                pressureText={formatPressure(weatherData.current.pressure)}
                humidityText={`${weatherData.current.humidity}%`}
                locale={preferences.locale}
                use24HourTime={use24HourTime}
              />
            </View>
          )}
        </Animated.View>
      )}
      
      {/* UV Index with Glass Effect and Animation */}
      {uvIndex && (
        <Animated.View
          style={{
            opacity: uvCardAnim.opacity,
            transform: [{ translateY: uvCardAnim.translateY }],
          }}
        >
          {canUseGlass ? (
            <GlassView
              style={styles.glassCard}
              glassEffectStyle="regular"
              tintColor={colors.surfaceTint}
              accessibilityRole="alert"
              accessibilityLabel={`UV Index: ${uvIndex.value}, ${uvIndex.level}`}
            >
              <UVIndicator
                uvIndex={uvIndex}
                locale={preferences.locale}
                size="small"
              />
            </GlassView>
          ) : (
            <View
              style={[styles.solidCard, { backgroundColor: colors.surface }]}
              accessibilityRole="alert"
              accessibilityLabel={`UV Index: ${uvIndex.value}, ${uvIndex.level}`}
            >
              <UVIndicator
                uvIndex={uvIndex}
                locale={preferences.locale}
                size="small"
              />
            </View>
          )}
        </Animated.View>
      )}
      
      {/* Sunscreen Tracker */}
      <SunscreenTracker />
      
      {/* Quick Actions with Animation */}
      <Animated.View style={[styles.actionsContainer, { opacity: actionsAnim.opacity }]}>
        <Button
          title={t('home.viewDetails')}
          onPress={() => router.push('/(tabs)/(home)/weather')}
          variant="tonal"
          size="medium"
        />
        <Button
          title={t('home.uvAndSpf')}
          onPress={() => router.push('/(tabs)/(home)/uv')}
          variant="tonal"
          size="medium"
        />
      </Animated.View>
      <Animated.View style={[styles.forecastButton, { opacity: actionsAnim.opacity }]}>
        <Button
          title={t('home.sevenDayForecast')}
          onPress={() => router.push('/(tabs)/(home)/forecast')}
          variant="outlined"
          size="medium"
          fullWidth
        />
      </Animated.View>
      
      {/* UV Recommendations Preview */}
      {uvIndex && recommendations.length > 0 && spfRecommendation && (
        <UVRecommendations
          recommendations={recommendations.slice(0, 3)}
          spfRecommendation={spfRecommendation}
        />
      )}
      
      {/* Next Days Preview */}
      {days.length > 0 && (
        canUseGlass ? (
          <GlassView
            style={styles.forecastPreviewGlass}
            glassEffectStyle="regular"
            tintColor={colors.surfaceTint}
          >
            <View style={styles.forecastPreviewContent}>
              <Text variant="h3" style={[styles.forecastTitle, { color: colors.onSurface }]}>
                {t('home.nextDays')}
              </Text>
              {days.slice(1, 4).map((day) => (
                <View key={day.date} style={[styles.forecastItem, { borderBottomColor: colors.divider }]}>
                  <Text variant="body2" style={{ color: colors.onSurface }}>
                    {new Date(day.date).toLocaleDateString(preferences.locale, { weekday: 'short' })}
                  </Text>
                  <Text variant="body2" style={{ color: colors.primary }}>
                    {getForecastTempWithUnit(day.temperature.max)} / {getForecastTempWithUnit(day.temperature.min)}
                  </Text>
                </View>
              ))}
            </View>
          </GlassView>
        ) : (
          <View style={[styles.forecastPreview, { backgroundColor: colors.surfaceVariant }]}>
            <Text variant="h3" style={[styles.forecastTitle, { color: colors.onSurface }]}>
              {t('home.nextDays')}
            </Text>
            {days.slice(1, 4).map((day) => (
              <View key={day.date} style={[styles.forecastItem, { borderBottomColor: colors.divider }]}>
                <Text variant="body2" style={{ color: colors.onSurface }}>
                  {new Date(day.date).toLocaleDateString(preferences.locale, { weekday: 'short' })}
                </Text>
                <Text variant="body2" style={{ color: colors.primary }}>
                  {getForecastTempWithUnit(day.temperature.max)} / {getForecastTempWithUnit(day.temperature.min)}
                </Text>
              </View>
            ))}
          </View>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxs,
  },
  refreshIconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor set dynamically to colors.surfaceVariant in JSX
  },
  refreshIconButtonDisabled: {
    opacity: 0.4,
  },
  locationDisplayWrapper: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    minWidth: 200,
  },
  // Glass card wrapper (iOS 26+)
  glassCard: {
    borderRadius: borderRadius.xl,
    marginVertical: spacing.xs,
    overflow: 'hidden',
  },
  // Solid card fallback (iOS < 26, Android, accessibility)
  solidCard: {
    borderRadius: borderRadius.xl,
    marginVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  forecastButton: {
    marginVertical: spacing.xxs,
  },
  forecastPreviewGlass: {
    borderRadius: borderRadius.xl,
    marginVertical: spacing.xs,
    overflow: 'hidden',
  },
  forecastPreviewContent: {
    padding: spacing.lg,
  },
  forecastPreview: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  forecastTitle: {
    marginBottom: spacing.sm,
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    // borderBottomColor set dynamically in JSX
  },
});
