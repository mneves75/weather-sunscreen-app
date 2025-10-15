/**
 * Main weather display card component
 */

import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import { WeatherData } from '@/src/types';
import { formatTime, getWeatherEmoji } from '@/src/utils';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface WeatherCardProps {
  data: WeatherData;
  onPress?: () => void;
  showLastUpdated?: boolean;
  temperatureText?: string;
  feelsLikeText?: string;
  windText?: string;
  pressureText?: string;
  humidityText?: string;
  locale?: string;
  use24HourTime?: boolean;
}

export const WeatherCard = React.memo<WeatherCardProps>(({
  data,
  onPress,
  showLastUpdated = true,
  temperatureText,
  feelsLikeText,
  windText,
  pressureText,
  humidityText,
  locale = 'en-US',
  use24HourTime = false,
}) => {
  const colors = useColors();
  const { t } = useTranslation();

  const Container = onPress ? TouchableOpacity : View;

  // ACCESSIBILITY & NULL SAFETY: Use optional chaining (?.) to safely access nested properties.
  // - data.location?.city: Returns undefined if location is null/undefined, fallback to 'Unknown location'
  // - data.current?.condition?.description: Safely access condition translation key (e.g., "weather.conditions.2")
  // - t(key): Translates the key to current language (pt-BR shows "Parcialmente nublado", en shows "Partly cloudy")
  // - Fallback to 'Unknown': If key doesn't exist or is falsy, shows 'Unknown' instead of raw key
  // This prevents crashes from undefined data while ensuring proper i18n translation of weather conditions.

  const temperatureDisplay = temperatureText ?? `${Math.round(data.current.temperature)}°`;
  const feelsLikeDisplay = feelsLikeText ?? `${Math.round(data.current.feelsLike)}°`;
  const windDisplay = windText ?? `${Math.round(data.current.windSpeed)} km/h`;
  const pressureDisplay = pressureText ?? `${data.current.pressure} hPa`;
  const humidityDisplay = humidityText ?? `${data.current.humidity}%`;

  return (
    <Container
      style={styles.container}
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={t('accessibility.weatherCard.summary', {
        defaultValue: 'Weather for {{city}}. Temperature {{temperature}}. {{description}}',
        city: data.location?.city || 'Unknown location',
        temperature: temperatureDisplay,
        description: data.current?.condition?.description ? t(data.current.condition.description) : 'Unknown',
      })}
    >
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Text variant="h2" style={{ color: colors.onSurface }}>
            {data.location.city}
          </Text>
          {data.location.country && (
            <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
              {data.location.country}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.temperatureContainer}>
          <Text style={[styles.temperature, { color: colors.primary }]}>
            {temperatureDisplay}
          </Text>
          <Text variant="body1" style={{ color: colors.onSurfaceVariant }}>
            {t('weatherCard.feelsLike', { defaultValue: 'Feels like {{value}}', value: feelsLikeDisplay })}
          </Text>
        </View>

        <View style={styles.conditionContainer}>
          {/* TODO: Replace emoji with SF Symbols (iOS) or Material Icons (Android) for premium feel */}
          <Text style={styles.emoji}>
            {getWeatherEmoji(data.current.condition.wmoCode || 0)}
          </Text>
          {/*
            TRANSLATION: condition.description is an i18n key like "weather.conditions.2"
            The t() function translates it to the current language.
            If translation key is missing or null, falls back to 'Unknown' to prevent exposing raw keys.
          */}
          <Text variant="body1" style={{ color: colors.onSurface }}>
            {data.current?.condition?.description ? t(data.current.condition.description) : 'Unknown'}
          </Text>
        </View>
      </View>

      <View style={[styles.details, { borderTopColor: colors.divider }]}>
        <View style={styles.detailItem}>
          <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
            {t('weatherCard.humidity', 'Humidity')}
          </Text>
          <Text variant="body2" style={{ color: colors.onSurface }}>
            {humidityDisplay}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
            {t('weatherCard.wind', 'Wind')}
          </Text>
          <Text variant="body2" style={{ color: colors.onSurface }}>
            {windDisplay}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
            {t('weatherCard.pressure', 'Pressure')}
          </Text>
          <Text variant="body2" style={{ color: colors.onSurface }}>
            {pressureDisplay}
          </Text>
        </View>
      </View>

      {showLastUpdated && (
        <Text variant="caption" style={[styles.timestamp, { color: colors.onSurfaceVariant }]}>
          {t('weatherCard.updated', {
            defaultValue: 'Updated {{time}}',
            time: formatTime(data.current.timestamp, { locale, use24Hour: use24HourTime }),
          })}
        </Text>
      )}
    </Container>
  );
});

WeatherCard.displayName = 'WeatherCard';

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,    // Premium 20px radius (Apple standard)
    padding: 20,
    marginVertical: 8,
    // Shadow applied via theme shadow.lg for soft, layered depth
  },
  header: {
    marginBottom: 16,
  },
  locationContainer: {
    gap: 4,
  },
  main: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  temperatureContainer: {
    gap: 4,
  },
  temperature: {
    fontSize: 64,
    fontWeight: '300',
    lineHeight: 70,      // Tighter line height (1.1 ratio)
    letterSpacing: -0.5, // Apple-style tight spacing for large numbers
  },
  conditionContainer: {
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 48,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    // borderTopColor will be set dynamically in component
  },
  detailItem: {
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    marginTop: 12,
    textAlign: 'center',
  },
});
