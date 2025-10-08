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

import { Button, Container, ErrorView, LoadingSpinner, Text, CircularProgress } from '@/src/components/ui';
import {
    LocationDisplay,
    SunscreenTracker,
    UVIndicator,
    UVRecommendations,
    WeatherCard,
    TemperatureDisplay,
    WeatherGradient,
    type WeatherType,
} from '@/src/components/weather';
import { useSettings } from '@/src/context/SettingsContext';
import { LocationError, useForecast, useLocation, useUVIndex, useWeatherData } from '@/src/hooks';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useColors, useGlassAvailability } from '@/src/theme';
import { tokens } from '@/src/theme/tokens';
import { createFadeInComponent, createSlideUpComponent } from '@/src/theme/animations';
import { getStaggerDelay } from '@/src/theme/animations';
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
  const { trigger: triggerHaptic } = useHaptics();
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
    uvLevelLabel,
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

  // Helper: Determine weather type for gradient/tinting
  const getWeatherType = (condition: string): WeatherType => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return 'sunny';
    if (lowerCondition.includes('rain') || lowerCondition.includes('storm')) return 'rainy';
    if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) return 'cloudy';
    if (lowerCondition.includes('snow') || lowerCondition.includes('ice')) return 'snowy';
    return 'default';
  };
  
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
      
      {/* Hero Temperature Display with Weather Gradient */}
      {weatherData && (
        <Animated.View
          style={{
            opacity: weatherCardAnim.opacity,
            transform: [{ translateY: weatherCardAnim.translateY }],
          }}
        >
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              router.push('/(tabs)/(home)/weather');
            }}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={t('accessibility.weatherCard.currentWeather', {
              temperature: weatherData.current.temperature,
              condition: weatherData.current.condition.description,
            })}
            accessibilityHint={t('accessibility.weatherCard.hint')}
          >
            <WeatherGradient weatherType={getWeatherType(weatherData.current.condition.description)}>
              <TemperatureDisplay
                temperature={weatherData.current.temperature}
                unit={preferences.temperatureUnit === 'celsius' ? 'C' : 'F'}
                condition={weatherData.current.condition.description}
                weatherType={getWeatherType(weatherData.current.condition.description)}
              />
            </WeatherGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* UV Index with Animated Circular Progress */}
      {uvIndex && (
        <Animated.View
          style={{
            opacity: uvCardAnim.opacity,
            transform: [{ translateY: uvCardAnim.translateY }],
          }}
        >
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              router.push('/(tabs)/(home)/uv');
            }}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={`UV Index: ${uvIndex.value}, ${uvIndex.level}`}
            accessibilityHint="Double tap to view UV details and recommendations"
            style={styles.uvCardContainer}
          >
            {canUseGlass ? (
              <GlassView
                style={styles.glassCard}
                glassEffectStyle="regular"
                tintColor={colors.surfaceTint}
              >
                <View style={styles.uvCardContent}>
                  <CircularProgress
                    value={uvIndex.value}
                    max={11}
                    size={160}
                    trackWidth={12}
                    gradient={['#30D158', '#FFD60A', '#FF9F0A', '#FF453A', '#BF5AF2']}
                  >
                    <View style={styles.uvProgressCenter}>
                      <Text variant="h1" style={{ color: colors.onSurface, fontSize: 56, fontWeight: '300' }}>
                        {uvIndex.value}
                      </Text>
                      <Text variant="body2" style={{ color: colors.onSurfaceVariant, marginTop: spacing.xxs }}>
                        {uvLevelLabel}
                      </Text>
                    </View>
                  </CircularProgress>
                  <Text variant="body1" style={{ color: colors.onSurface, marginTop: spacing.md }}>
                    SPF {spfRecommendation?.minimumSpf || 30}+ {t('home.recommended')}
                  </Text>
                </View>
              </GlassView>
            ) : (
              <View style={[styles.solidCard, { backgroundColor: colors.surface }]}>
                <View style={styles.uvCardContent}>
                  <CircularProgress
                    value={uvIndex.value}
                    max={11}
                    size={160}
                    trackWidth={12}
                    gradient={['#30D158', '#FFD60A', '#FF9F0A', '#FF453A', '#BF5AF2']}
                  >
                    <View style={styles.uvProgressCenter}>
                      <Text variant="h1" style={{ color: colors.onSurface, fontSize: 56, fontWeight: '300' }}>
                        {uvIndex.value}
                      </Text>
                      <Text variant="body2" style={{ color: colors.onSurfaceVariant, marginTop: spacing.xxs }}>
                        {uvLevelLabel}
                      </Text>
                    </View>
                  </CircularProgress>
                  <Text variant="body1" style={{ color: colors.onSurface, marginTop: spacing.md }}>
                    SPF {spfRecommendation?.minimumSpf || 30}+ {t('home.recommended')}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Sunscreen Tracker */}
      <SunscreenTracker />
      
      {/* Quick Actions with Animation */}
      <Animated.View style={[styles.actionsContainer, { opacity: actionsAnim.opacity }]}>
        <Button
          title={t('home.viewDetails')}
          onPress={() => {
            triggerHaptic('light');
            router.push('/(tabs)/(home)/weather');
          }}
          variant="tonal"
          size="medium"
        />
        <Button
          title={t('home.uvAndSpf')}
          onPress={() => {
            triggerHaptic('light');
            router.push('/(tabs)/(home)/uv');
          }}
          variant="tonal"
          size="medium"
        />
      </Animated.View>
      <Animated.View style={[styles.forecastButton, { opacity: actionsAnim.opacity }]}>
        <Button
          title={t('home.sevenDayForecast')}
          onPress={() => {
            triggerHaptic('light');
            router.push('/(tabs)/(home)/forecast');
          }}
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
  uvCardContainer: {
    marginVertical: spacing.xs,
  },
  uvCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  uvProgressCenter: {
    alignItems: 'center',
    justifyContent: 'center',
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
