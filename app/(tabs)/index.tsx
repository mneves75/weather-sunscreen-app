/**
 * Home/Dashboard Screen
 * Main screen showing weather summary, UV index, and quick actions
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
import { useColors } from '@/src/theme/theme';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, Linking, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { preferences } = useSettings();
  
  // Get weather data
  const { 
    weatherData, 
    isLoading: isLoadingWeather, 
    error: weatherError, 
    refresh: refreshWeather,
  } = useWeatherData();
  
  // Get forecast data
  const { 
    days,
    isLoading: isLoadingForecast,
    error: forecastError,
    refresh: refreshForecast,
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
              preferences.locale === 'pt-BR' ? 'Permissão Negada' : 'Permission Denied',
              preferences.locale === 'pt-BR'
                ? 'Por favor, habilite a permissão de localização nas configurações do dispositivo.'
                : 'Please enable location permission in device settings.',
              [
                { text: 'OK' },
                {
                  text: preferences.locale === 'pt-BR' ? 'Abrir Configurações' : 'Open Settings',
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
        preferences.locale === 'pt-BR' ? 'Erro' : 'Error',
        preferences.locale === 'pt-BR'
          ? 'Não foi possível obter sua localização.'
          : 'Could not get your location.',
        [{ text: 'OK' }]
      );
    }
  }, [permissionStatus, getCurrentLocation, preferences.locale]);
  
  const isLoading = isLoadingWeather || isLoadingForecast || isLoadingUV;
  const hasError = weatherError || forecastError || uvError;
  
  // Show loading on first load
  if (isLoading && !weatherData && !uvIndex) {
    return (
      <Container style={styles.centerContainer}>
        <LoadingSpinner message={preferences.locale === 'pt-BR' ? 'Carregando...' : 'Loading...'} />
      </Container>
    );
  }
  
  // Show location request if no location
  if (!currentLocation && !isRequesting) {
    return (
      <Container style={styles.centerContainer}>
        <Text variant="h2" style={[styles.title, { color: colors.onBackground }]}>
          {preferences.locale === 'pt-BR' ? '☀️ Bem-vindo!' : '☀️ Welcome!'}
        </Text>
        <Text variant="body1" style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          {preferences.locale === 'pt-BR'
            ? 'Precisamos da sua localização para fornecer informações meteorológicas e recomendações de UV.'
            : 'We need your location to provide weather information and UV recommendations.'}
        </Text>
        <Button
          title={preferences.locale === 'pt-BR' ? 'Permitir Localização' : 'Allow Location'}
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
          message={
            preferences.locale === 'pt-BR'
              ? 'Não foi possível carregar os dados meteorológicos.'
              : 'Could not load weather data.'
          }
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
    >
      {/* Location Display */}
      {weatherData?.location && (
        <LocationDisplay
          location={weatherData.location}
          onPress={() => router.push('/(tabs)/(home)/weather')}
        />
      )}
      
      {/* Weather Card */}
      {weatherData && (
        <WeatherCard
          data={weatherData}
          onPress={() => router.push('/(tabs)/(home)/weather')}
        />
      )}
      
      {/* UV Index */}
      {uvIndex && (
        <UVIndicator
          uvIndex={uvIndex}
          locale={preferences.locale}
          size="small"
        />
      )}
      
      {/* Sunscreen Tracker */}
      <SunscreenTracker />
      
      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title={preferences.locale === 'pt-BR' ? 'Ver Detalhes' : 'View Details'}
          onPress={() => router.push('/(tabs)/(home)/weather')}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title={preferences.locale === 'pt-BR' ? 'UV e SPF' : 'UV & SPF'}
          onPress={() => router.push('/(tabs)/(home)/uv')}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title={preferences.locale === 'pt-BR' ? 'Previsão 7 Dias' : '7-Day Forecast'}
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
            {preferences.locale === 'pt-BR' ? 'Próximos Dias' : 'Next Days'}
          </Text>
          {days.slice(1, 4).map((day) => (
            <View key={day.date} style={styles.forecastItem}>
              <Text variant="body2" style={{ color: colors.onSurface }}>
                {new Date(day.date).toLocaleDateString(preferences.locale, { weekday: 'short' })}
              </Text>
              <Text variant="body2" style={{ color: colors.primary }}>
                {Math.round(day.temperature.max)}° / {Math.round(day.temperature.min)}°
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
