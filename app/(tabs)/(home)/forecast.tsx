/**
 * Forecast Screen
 * 7-day weather forecast display
 *
 * Modernized with:
 * - Header with date range summary
 * - Glass effect header (iOS 26+)
 * - Improved visual hierarchy
 * - Accessibility enhancements
 */

import { Container, ErrorView, LoadingSpinner, Text } from '@/src/components/ui';
import { ForecastList } from '@/src/components/weather';
import { useSettings } from '@/src/context/SettingsContext';
import { useForecast } from '@/src/hooks';
import { useColors } from '@/src/theme/theme';
import { useGlassAvailability } from '@/src/theme/glassHelpers';
import { tokens } from '@/src/theme/tokens';
import { GlassView } from 'expo-glass-effect';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const { spacing, borderRadius } = tokens;

export default function ForecastScreen() {
  const colors = useColors();
  const { canUseGlass } = useGlassAvailability();
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
  
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 6);

  const dateRangeText = `${today.toLocaleDateString(preferences.locale, { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString(preferences.locale, { month: 'short', day: 'numeric' })}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with date range */}
      {days.length > 0 && (
        canUseGlass ? (
          <GlassView
            style={[styles.glassHeader, { borderBottomColor: colors.divider }]}
            glassEffectStyle="regular"
            tintColor={colors.surfaceTint}
            accessibilityRole="header"
            accessibilityLabel={t('forecast.header', '7-Day Forecast')}
          >
            <View style={styles.headerContent}>
              <Text variant="h2" style={{ color: colors.onSurface }}>
                {t('forecast.title', '7-Day Forecast')}
              </Text>
              <Text variant="body2" style={{ color: colors.onSurfaceVariant }}>
                {dateRangeText}
              </Text>
            </View>
          </GlassView>
        ) : (
          <View style={[styles.solidHeader, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
            <Text variant="h2" style={{ color: colors.onSurface }}>
              {t('forecast.title', '7-Day Forecast')}
            </Text>
            <Text variant="body2" style={{ color: colors.onSurfaceVariant }}>
              {dateRangeText}
            </Text>
          </View>
        )
      )}

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
  glassHeader: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    // borderBottomColor set via inline style for theme awareness
  },
  headerContent: {
    gap: spacing.xxs,
  },
  solidHeader: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.xxs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderBottomWidth: 1,
    // borderBottomColor set via inline style for theme awareness
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
});
