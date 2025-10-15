/**
 * Detailed weather information component
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

  const windDirection = degreesToCardinal(data.current.windDirection);
  const windDesc = getWindDescription(data.current.windSpeed, locale);
  const humidityLevel = getHumidityLevel(data.current.humidity, locale);

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
        <DetailItem
          label={t('weatherDetails.humidity', 'Humidity')}
          value={`${data.current.humidity}%`}
          subtitle={t(humidityLevel)}
        />
        
        <DetailItem
          label={t('weatherDetails.wind', 'Wind')}
          value={windValueDisplay}
          subtitle={`${t(windDirection)} • ${t(windDesc)}`}
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
