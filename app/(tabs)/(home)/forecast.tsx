/**
 * Forecast Screen
 * 7-day weather forecast display
 */

import { Container, ErrorView, LoadingSpinner, Text } from '@/src/components/ui';
import { ForecastList } from '@/src/components/weather';
import { useSettings } from '@/src/context/SettingsContext';
import { useForecast } from '@/src/hooks';
import { useColors } from '@/src/theme/theme';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function ForecastScreen() {
  const colors = useColors();
  const { preferences } = useSettings();
  const { t } = useTranslation();
  
  const { 
    days,
    isLoading, 
    error, 
    refresh,
    getTemperatureWithUnit,
  } = useForecast();
  
  // Show loading on first load
  if (isLoading && days.length === 0) {
    return (
      <Container style={styles.centerContainer}>
        <LoadingSpinner message={t('common.loading')} />
      </Container>
    );
  }
  
  // Show error if data failed to load
  if (error && days.length === 0) {
    return (
      <Container style={styles.centerContainer}>
        <ErrorView
          message={t('errors.forecastData')}
          onRetry={refresh}
        />
      </Container>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {days.length > 0 ? (
        <ForecastList
          days={days}
          onRefresh={refresh}
          refreshing={isLoading}
          locale={preferences.locale}
          formatTemperature={getTemperatureWithUnit}
        />
      ) : (
        <Container style={styles.centerContainer}>
          <Text variant="body1" style={{ color: colors.onSurfaceVariant }}>
            {t('forecast.noData')}
          </Text>
        </Container>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
