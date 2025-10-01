/**
 * Weather Detail Screen
 * Detailed weather information display
 */

import { Container, ErrorView, LoadingSpinner } from '@/src/components/ui';
import { LocationDisplay, WeatherCard, WeatherDetails } from '@/src/components/weather';
import { useSettings } from '@/src/context/SettingsContext';
import { useWeatherData } from '@/src/hooks';
import { useColors } from '@/src/theme/theme';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

export default function WeatherDetailScreen() {
  const colors = useColors();
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
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Location Display */}
      {weatherData.location && (
        <LocationDisplay
          location={weatherData.location}
          showCoordinates
        />
      )}
      
      {/* Weather Card */}
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
      
      {/* Detailed Information */}
      <WeatherDetails
        data={weatherData}
        locale={preferences.locale}
        speedUnit={speedUnit}
        pressureUnit={pressureUnit}
        temperatureUnit={temperatureUnit}
      />
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
});
