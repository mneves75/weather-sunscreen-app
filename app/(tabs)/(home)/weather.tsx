/**
 * Weather Detail Screen
 * Detailed weather information display
 * 
 * Modernized with:
 * - Sticky glass header with location
 * - Segmented glass sections for organized data
 * - Metric chips for quick insights
 * - Material Design elevation fallbacks
 */

import { Container, ErrorView, LoadingSpinner, Text } from '@/src/components/ui';
import { LocationDisplay, WeatherCard, WeatherDetails } from '@/src/components/weather';
import { useSettings } from '@/src/context/SettingsContext';
import { useWeatherData } from '@/src/hooks';
import { useColors, useGlassAvailability, useThemeTokens } from '@/src/theme';
import { GlassView } from 'expo-glass-effect';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function WeatherDetailScreen() {
  const colors = useColors();
  const { canUseGlass } = useGlassAvailability();
  const { spacing } = useThemeTokens();
  const { preferences } = useSettings();
  const use24HourTime = preferences.timeFormat === '24h' || (preferences.timeFormat === 'system' && preferences.locale === 'pt-BR');
  const { t } = useTranslation();
  
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
  
  // Metric chip data for quick insights
  const metricChips = [
    {
      label: t('weather.feelsLike', 'Feels Like'),
      value: getTemperatureWithUnit(weatherData.current.feelsLike),
      icon: '🌡️',
    },
    {
      label: t('weather.humidity', 'Humidity'),
      value: `${weatherData.current.humidity}%`,
      icon: '💧',
    },
    {
      label: t('weather.wind', 'Wind'),
      value: formatWindSpeed(weatherData.current.windSpeed),
      icon: '💨',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      stickyHeaderIndices={[0]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Sticky Header with Location */}
      {canUseGlass ? (
        <GlassView 
          style={styles.stickyHeader}
          glassEffectStyle="regular"
          tintColor={colors.surfaceTint}
        >
          {weatherData.location && (
            <LocationDisplay
              location={weatherData.location}
              showCoordinates
            />
          )}
        </GlassView>
      ) : (
        <View style={[styles.stickyHeader, styles.solidHeader, { backgroundColor: colors.surface }]}>
          {weatherData.location && (
            <LocationDisplay
              location={weatherData.location}
              showCoordinates
            />
          )}
        </View>
      )}
      
      {/* Hero Weather Card with Glass */}
      {canUseGlass ? (
        <GlassView 
          style={styles.heroCard}
          glassEffectStyle="regular"
          tintColor={colors.surfaceTint}
          accessibilityRole="header"
          accessibilityLabel={`Current weather: ${weatherData.current.temperature} degrees, ${weatherData.current.condition.description}`}
        >
          <WeatherCard
            data={weatherData}
            showLastUpdated
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
          style={[styles.heroCard, styles.solidCard, { backgroundColor: colors.surface }]}
          accessibilityRole="header"
          accessibilityLabel={`Current weather: ${weatherData.current.temperature} degrees, ${weatherData.current.condition.description}`}
        >
          <WeatherCard
            data={weatherData}
            showLastUpdated
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

      {/* Metric Chips Row */}
      <View style={styles.chipRow}>
        {metricChips.map((chip, index) => (
          <View
            key={chip.label}
            style={[
              canUseGlass ? styles.chipGlass : styles.chipSolid,
              canUseGlass ? {} : { backgroundColor: colors.surfaceVariant },
            ]}
            accessibilityRole="text"
            accessibilityLabel={`${chip.label}: ${chip.value}`}
          >
            {canUseGlass ? (
              <GlassView 
                style={styles.chipContent}
                glassEffectStyle="regular"
              >
                <Text style={styles.chipIcon}>{chip.icon}</Text>
                <Text variant="caption" style={[styles.chipLabel, { color: colors.onSurfaceVariant }]}>
                  {chip.label}
                </Text>
                <Text variant="body2" style={[styles.chipValue, { color: colors.onSurface }]}>
                  {chip.value}
                </Text>
              </GlassView>
            ) : (
              <View style={styles.chipContent}>
                <Text style={styles.chipIcon}>{chip.icon}</Text>
                <Text variant="caption" style={[styles.chipLabel, { color: colors.onSurfaceVariant }]}>
                  {chip.label}
                </Text>
                <Text variant="body2" style={[styles.chipValue, { color: colors.onSurface }]}>
                  {chip.value}
                </Text>
              </View>
            )}
          </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 0, // Sticky header handles its own padding
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  // Sticky header (iOS 26+ glass, others solid)
  stickyHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  solidHeader: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  // Hero weather card
  heroCard: {
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  // Glass card wrapper
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
    gap: 12,
    marginBottom: 16,
  },
  chipGlass: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  chipSolid: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  chipContent: {
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  chipIcon: {
    fontSize: 24,
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
    borderRadius: 20,
    overflow: 'hidden',
  },
});
