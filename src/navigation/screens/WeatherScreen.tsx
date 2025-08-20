import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useWeather } from '../../context/WeatherContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export function WeatherScreen() {
  const { weatherData, isLoading, error, loadWeatherData, refreshWeatherData, clearError } = useWeather();

  useEffect(() => {
    loadWeatherData();
  }, []);

  if (isLoading && !weatherData) {
    return <LoadingSpinner message="Loading weather data..." />;
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
        message="No weather data available" 
        onRetry={loadWeatherData}
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
      <View style={styles.header}>
        <Text style={styles.locationName}>{weatherData.location.name}</Text>
        <Text style={styles.country}>{weatherData.location.country}</Text>
        <Text style={styles.coordinates}>
          {weatherData.location.lat.toFixed(4)}°, {weatherData.location.lon.toFixed(4)}°
        </Text>
      </View>

      <View style={styles.currentWeather}>
        <Text style={styles.temperature}>
          {Math.round(weatherData.current.temperature)}°C
        </Text>
        <Text style={styles.description}>{weatherData.current.description}</Text>
        <Text style={styles.feelsLike}>
          Feels like {Math.round(weatherData.current.feelsLike)}°C
        </Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Humidity</Text>
          <Text style={styles.detailValue}>{weatherData.current.humidity}%</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Wind Speed</Text>
          <Text style={styles.detailValue}>{weatherData.current.windSpeed} m/s</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pressure</Text>
          <Text style={styles.detailValue}>{weatherData.current.pressure} hPa</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Visibility</Text>
          <Text style={styles.detailValue}>{weatherData.current.visibility} km</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  locationName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  country: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    color: '#95A5A6',
    fontFamily: 'monospace',
  },
  currentWeather: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  temperature: {
    fontSize: 72,
    fontWeight: '300',
    color: '#4A90E2',
    marginBottom: 8,
  },
  description: {
    fontSize: 20,
    color: '#34495E',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  feelsLike: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  details: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F4FD',
  },
  detailLabel: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
});