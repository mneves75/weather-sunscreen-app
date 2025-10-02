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
import { useForecast, useLocation, useUVIndex, useWeatherData } from '@/src/hooks';
import { useColors, useGlassAvailability } from '@/src/theme';
import { GlassView } from 'expo-glass-effect';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const colors = useColors();
  const { canUseGlass } = useGlassAvailability();
  const router = useRouter();
  const { preferences } = useSettings();
  const { t } = useTranslation();
  const use24HourTime = preferences.timeFormat === '24h' || (preferences.timeFormat === 'system' && preferences.locale === 'pt-BR');
  
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
    requestPermission,
    getCurrentLocation,
  } = useLocation();
  
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
    if (permissionStatus === 'denied') {
      Alert.alert(
        t('location.permissionDenied'),
        t('location.permissionDeniedMessage'),
        [
          { text: 'OK' },
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
      return;
    }

    const coords = await getCurrentLocation();
    if (!coords) {
      Alert.alert(
        t('location.error'),
        t('location.errorMessage'),
        [{ text: 'OK' }]
      );
    }
  }, [permissionStatus, getCurrentLocation, t]);
  
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
        <LocationDisplay
          location={weatherData.location}
          onPress={() => router.push('/(tabs)/(home)/weather')}
        />
      )}
      
      {/* Weather Card with Glass Effect */}
      {weatherData && (
        canUseGlass ? (
          <GlassView 
            style={styles.glassCard}
            glassEffectStyle="regular"
            tintColor={colors.surfaceTint}
            accessibilityRole="button"
            accessibilityLabel={`Current weather: ${weatherData.current.temperature} degrees, ${weatherData.current.condition.description}`}
            accessibilityHint="Double tap to view detailed weather information"
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
            accessibilityHint="Double tap to view detailed weather information"
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
        )
      )}
      
      {/* UV Index with Glass Effect */}
      {uvIndex && (
        canUseGlass ? (
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
        )
      )}
      
      {/* Sunscreen Tracker */}
      <SunscreenTracker />
      
      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title={t('home.viewDetails')}
          onPress={() => router.push('/(tabs)/(home)/weather')}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title={t('home.uvAndSpf')}
          onPress={() => router.push('/(tabs)/(home)/uv')}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title={t('home.sevenDayForecast')}
          onPress={() => router.push('/(tabs)/(home)/forecast')}
          variant="outline"
          style={styles.actionButton}
        />
      </View>
      
      {/* UV Recommendations Preview */}
      {uvIndex && recommendations.length > 0 && spfRecommendation && (
        <UVRecommendations
          recommendations={recommendations.slice(0, 3)}
          spfRecommendation={spfRecommendation}
        />
      )}
      
      {/* Next Days Preview */}
      {days.length > 0 && (
        <View style={[styles.forecastPreview, { backgroundColor: colors.surface }]}>
          <Text variant="h3" style={[styles.forecastTitle, { color: colors.onSurface }]}>
            {t('home.nextDays')}
          </Text>
          {days.slice(1, 4).map((day) => (
            <View key={day.date} style={styles.forecastItem}>
              <Text variant="body2" style={{ color: colors.onSurface }}>
                {new Date(day.date).toLocaleDateString(preferences.locale, { weekday: 'short' })}
              </Text>
              <Text variant="body2" style={{ color: colors.primary }}>
                {getForecastTempWithUnit(day.temperature.max)} / {getForecastTempWithUnit(day.temperature.min)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    minWidth: 200,
  },
  // Glass card wrapper (iOS 26+)
  glassCard: {
    borderRadius: 20,
    marginVertical: 8,
    overflow: 'hidden',
  },
  // Solid card fallback (iOS < 26, Android, accessibility)
  solidCard: {
    borderRadius: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  actionButton: {
    flex: 1,
  },
  forecastPreview: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
  forecastTitle: {
    marginBottom: 12,
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
});
