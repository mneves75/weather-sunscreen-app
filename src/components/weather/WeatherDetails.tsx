/**
 * Detailed weather information component
 *
 * INTERNATIONALIZATION (i18n) TRANSLATION PATTERN:
 *
 * This component demonstrates the complete i18n flow from utility functions to translations:
 *
 * 1. UTILITY FUNCTIONS RETURN i18n KEYS (not strings):
 *    - getHumidityLevel(45) → 'weather.humidityLevels.dry'
 *    - getWindDescription(15) → 'weather.windLevels.lightBreeze'
 *    - degreesToCardinal(90) → 'weather.cardinal.E'
 *
 * 2. COMPONENT CALLS t() TO TRANSLATE:
 *    - t('weather.humidityLevels.dry') → "Dry" (English) or "Seco" (Portuguese)
 *    - t('weather.windLevels.lightBreeze') → "Light Breeze" or "Brisa Leve"
 *
 * 3. RESULT: Fully localized weather descriptions without hardcoding
 *
 * KEY COLLISION AVOIDANCE:
 * - Labels and descriptions use different keys to prevent overwrites:
 *   - Label: t('weatherDetails.humidity') → "Humidity"
 *   - Level: t(humidityLevel) → "Humidity" + t('weather.humidityLevels.dry') → "Very Dry"
 *
 * If old pattern was used (weather.humidity for both label and level), JSON would have:
 *   "weather": {
 *     "humidity": "Humidity",  // String label
 *     "humidity": { "dry": "Dry" }  // Object would OVERWRITE the label above!
 *   }
 * This causes the error: "returned an object instead of string"
 */

import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import { PressureUnit, SpeedUnit, TemperatureUnit, WeatherData } from '@/src/types';
import {
    degreesToCardinal,
    formatVisibility,
    getHumidityLevel,
    getWindDescription,
} from '@/src/utils';
import { convertPressure, convertSpeed, convertTemperature } from '@/src/utils';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface WeatherDetailsProps {
  data: WeatherData;
  locale?: string;
  speedUnit?: SpeedUnit;
  pressureUnit?: PressureUnit;
  temperatureUnit?: TemperatureUnit;
}

export const WeatherDetails = React.memo<WeatherDetailsProps>(({ 
  data,
  locale = 'en',
  speedUnit = 'kmh',
  pressureUnit = 'hPa',
  temperatureUnit = 'celsius',
}) => {
  const colors = useColors();
  const { t } = useTranslation();

  // Get i18n KEYS from utility functions (not translated strings yet)
  const windDirection = degreesToCardinal(data.current.windDirection);  // e.g., 'weather.cardinal.E'
  const windDesc = getWindDescription(data.current.windSpeed, locale);  // e.g., 'weather.windLevels.calm'
  const humidityLevel = getHumidityLevel(data.current.humidity, locale);  // e.g., 'weather.humidityLevels.dry'

  const convertedWind = convertSpeed(data.current.windSpeed, 'kmh', speedUnit);
  const windUnitLabel = speedUnit === 'kmh' ? 'km/h' : speedUnit === 'mph' ? 'mph' : 'm/s';
  const windValueDisplay = `${Math.round(convertedWind)} ${windUnitLabel}`;

  const convertedPressureValue = convertPressure(data.current.pressure, 'hPa', pressureUnit);
  const pressureUnitLabel = pressureUnit;
  const pressureValueDisplay = `${Math.round(convertedPressureValue)} ${pressureUnitLabel}`;

  const convertedFeelsLike = convertTemperature(data.current.feelsLike, 'celsius', temperatureUnit);
  const temperatureSymbol = temperatureUnit === 'celsius' ? '°C' : '°F';
  const feelsLikeDisplay = `${Math.round(convertedFeelsLike)}${temperatureSymbol}`;

  // Visibility unit follows speed unit convention: mph → miles, km/h → km, m/s → km
  // This provides a consistent user experience where distance units align with speed units
  const visibilityUnit = speedUnit === 'mph' ? 'imperial' : 'metric';
  
  const DetailItem = ({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) => (
    <View style={styles.detailItem}>
      <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text variant="h3" style={{ color: colors.onSurface }}>
        {value}
      </Text>
      {subtitle && (
        <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
  
  return (
    <View 
      style={[styles.container, { backgroundColor: colors.surface }]}
    >
      <Text variant="h3" style={[styles.title, { color: colors.onSurface }]}>
        {t('weatherDetails.title', 'Details')}
      </Text>
      
      <View style={styles.grid}>
        {/* HUMIDITY DETAIL ITEM
            - Label: from weatherDetails namespace (different from weather.humidityLevels)
            - Subtitle: from humidity LEVEL description (humidityLevel is i18n key like 'weather.humidityLevels.dry')
        */}
        <DetailItem
          label={t('weatherDetails.humidity', 'Humidity')}
          value={`${data.current.humidity}%`}
          subtitle={t(humidityLevel)}  {/* Translates i18n key → "Dry", "Very Humid", etc. */}
        />

        {/* WIND DETAIL ITEM
            - Label: from weatherDetails namespace
            - Cardinal direction: t(windDirection) transforms 'weather.cardinal.E' → "E"
            - Wind description: t(windDesc) transforms 'weather.windLevels.calm' → "Calm"
        */}
        <DetailItem
          label={t('weatherDetails.wind', 'Wind')}
          value={windValueDisplay}
          subtitle={`${t(windDirection)} • ${t(windDesc)}`}  {/* e.g., "NE • Light Breeze" */}
        />
        
        <DetailItem
          label={t('weatherDetails.pressure', 'Pressure')}
          value={pressureValueDisplay}
        />
        
        <DetailItem
          label={t('weatherDetails.visibility', 'Visibility')}
          value={formatVisibility(data.current.visibility, visibilityUnit)}
        />
        
        <DetailItem
          label={t('weatherDetails.cloudCover', 'Cloud Cover')}
          value={`${data.current.cloudCover}%`}
        />
        
        <DetailItem
          label={t('weatherDetails.feelsLike', 'Feels Like')}
          value={feelsLikeDisplay}
        />
      </View>
    </View>
  );
});

WeatherDetails.displayName = 'WeatherDetails';

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
  title: {
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  detailItem: {
    width: '45%',
    gap: 4,
  },
});
