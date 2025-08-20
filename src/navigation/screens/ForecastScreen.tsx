import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useWeather } from '../../context/WeatherContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { LiquidGlassWrapper, ExpoGlassContainer } from '../../components/glass/LiquidGlassWrapper';

export function ForecastScreen() {
  const { t } = useTranslation();
  const { weatherData, isLoading, error, refreshWeatherData, clearError } = useWeather();
  
  // Create localized date formatter
  const formatDate = createFormatDate(t);

  if (isLoading && !weatherData) {
    return <LoadingSpinner message={t('forecast.loading')} />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={() => {
          clearError();
          refreshWeatherData();
        }} 
      />
    );
  }

  if (!weatherData) {
    return (
      <ErrorMessage 
        message={t('forecast.error')} 
        onRetry={refreshWeatherData}
      />
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refreshWeatherData} />
      }
    >
      {/* Header with Liquid Glass Effect */}
      <LiquidGlassWrapper variant="prominent" style={styles.header}>
        <Text style={styles.title}>{t('forecast.title')}</Text>
        <View style={styles.locationInfo}>
          <Text style={styles.location}>{weatherData.location.name}</Text>
          <Text style={styles.coordinates}>
            {t('location.coordinates', { 
              lat: weatherData.location.lat.toFixed(4), 
              lon: weatherData.location.lon.toFixed(4) 
            })}
          </Text>
          <Text style={styles.country}>{weatherData.location.country}</Text>
        </View>
      </LiquidGlassWrapper>

      {weatherData.forecast.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>🔄</Text>
          <Text style={styles.emptyStateMessage}>{t('forecast.empty.title')}</Text>
          <Text style={styles.emptyStateSubtext}>
            {t('forecast.empty.subtitle')}
          </Text>
        </View>
      ) : (
        <View style={styles.forecastList}>
          {weatherData.forecast.map((day, index) => (
            <ExpoGlassContainer key={index}>
              <View style={styles.forecastItem}>
                <View style={styles.dateColumn}>
                  <Text style={styles.date}>{formatDate(day.date)}</Text>
                </View>
                
                <View style={styles.weatherColumn}>
                  <Text style={styles.weatherIcon}>{day.icon}</Text>
                  <Text style={styles.description}>{day.description}</Text>
                </View>
                
                <View style={styles.tempColumn}>
                  <Text style={styles.maxTemp}>{Math.round(day.maxTemp)}°</Text>
                  <Text style={styles.minTemp}>{Math.round(day.minTemp)}°</Text>
                </View>
                
                <View style={styles.uvColumn}>
                  <Text style={[styles.uvIndex, { color: getUVColor(day.uvIndex) }]}>
                    {t('forecast.uvIndex', { value: day.uvIndex })}
                  </Text>
                  <Text style={styles.precipitation}>{t('forecast.precipitation', { percent: day.precipitationChance })}</Text>
                </View>
              </View>
            </ExpoGlassContainer>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// Move this inside the component to access the t function
function createFormatDate(t: (key: string) => string) {
  return function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return t('forecast.today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('forecast.tomorrow');
    } else {
      // Use device locale for date formatting
      return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };
}

function getUVColor(uvValue: number): string {
  if (uvValue <= 2) return '#289D00'; // Low - Green
  if (uvValue <= 5) return '#F7D908'; // Moderate - Yellow
  if (uvValue <= 7) return '#F85D00'; // High - Orange
  if (uvValue <= 10) return '#E90B00'; // Very High - Red
  return '#B33DAD'; // Extreme - Violet
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    alignItems: 'center',
    margin: 20,
    padding: 20,
    // Glass effects handled by LiquidGlassWrapper
  },
  locationInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  location: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 2,
  },
  coordinates: {
    fontSize: 12,
    color: '#7F8C8D',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  country: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateMessage: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  forecastList: {
    paddingHorizontal: 20,
  },
  forecastItem: {
    // Background/border handled by ExpoGlassContainer
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateColumn: {
    flex: 2,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  weatherColumn: {
    flex: 3,
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  tempColumn: {
    flex: 2,
    alignItems: 'center',
  },
  maxTemp: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  minTemp: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  uvColumn: {
    flex: 2,
    alignItems: 'flex-end',
  },
  uvIndex: {
    fontSize: 12,
    color: '#F85D00',
    fontWeight: '600',
  },
  precipitation: {
    fontSize: 12,
    color: '#4A90E2',
  },
});