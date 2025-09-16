import React, { memo, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useWeather } from '../../src/context/WeatherContext';
import { useTheme } from '../../src/theme/theme';
import { WeatherSummaryCard } from '../../src/components/home/WeatherSummaryCard';
import { UVIndexCard } from '../../src/components/home/UVIndexCard';
import { QuickActionsGrid } from '../../src/components/home/QuickActionsGrid';
import { ForecastPreview } from '../../src/components/home/ForecastPreview';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { ErrorMessage } from '../../src/components/ui/ErrorMessage';
import { logger } from '../../src/services/loggerService';

function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { weatherData, isLoading, error, loadWeatherData, refreshWeatherData, clearError } =
    useWeather();

  // Load weather data on mount
  useEffect(() => {
    logger.info('HomeScreen: Loading initial weather data');
    loadWeatherData();
  }, [loadWeatherData]);

  // Memoize styles for performance
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Handle error recovery
  const handleRetry = () => {
    clearError();
    refreshWeatherData();
  };

  // Loading state
  if (isLoading && !weatherData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            Weather Dashboard
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && !weatherData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            Weather Dashboard
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <ErrorMessage message={error} onRetry={handleRetry} retryText="Retry" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      testID="homescreen-scrollview"
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refreshWeatherData}
          tintColor={colors.primary}
        />
      }
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          Weather Dashboard
        </Text>
        {weatherData?.location.name && (
          <Text style={styles.locationText}>
            {weatherData.location.name}, {weatherData.location.country}
          </Text>
        )}
      </View>

      <View style={styles.content}>
        <WeatherSummaryCard weatherData={weatherData} style={styles.card} />

        <UVIndexCard uvData={weatherData?.uvIndex} style={styles.card} />

        <QuickActionsGrid
          onWeatherPress={() => router.push('/(tabs)/weather')}
          onUVPress={() => router.push('/(tabs)/uv')}
          onForecastPress={() => router.push('/(tabs)/forecast')}
          onSettingsPress={() => router.push('/(tabs)/settings')}
          style={styles.card}
        />

        <ForecastPreview
          forecast={weatherData?.forecast?.slice(0, 3) || []}
          onViewAllPress={() => router.push('/(tabs)/forecast')}
          style={styles.card}
        />
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
    },
    locationText: {
      fontSize: 16,
      color: colors.secondary,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    card: {
      marginBottom: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      fontSize: 16,
      color: colors.secondary,
      marginTop: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    errorBanner: {
      backgroundColor: colors.errorBackground || colors.error + '20',
      padding: 12,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 8,
    },
    errorBannerText: {
      color: colors.error,
      fontSize: 14,
      textAlign: 'center',
    },
  });

// Export memoized component for performance
export default memo(HomeScreen);
