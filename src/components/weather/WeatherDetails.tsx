/**
 * Detailed weather information component
 */

import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import { WeatherData } from '@/src/types';
import {
    degreesToCardinal,
    formatVisibility,
    getHumidityLevel,
    getWindDescription,
} from '@/src/utils';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface WeatherDetailsProps {
  data: WeatherData;
  locale?: string;
  speedUnit?: string;
  pressureUnit?: string;
}

export const WeatherDetails = React.memo<WeatherDetailsProps>(({ 
  data,
  locale = 'en',
  speedUnit = 'km/h',
  pressureUnit = 'hPa',
}) => {
  const colors = useColors();
  
  const windDirection = degreesToCardinal(data.current.windDirection);
  const windDesc = getWindDescription(data.current.windSpeed, locale);
  const humidityLevel = getHumidityLevel(data.current.humidity, locale);
  
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
        {locale === 'pt-BR' ? 'Detalhes' : 'Details'}
      </Text>
      
      <View style={styles.grid}>
        <DetailItem
          label={locale === 'pt-BR' ? 'Umidade' : 'Humidity'}
          value={`${data.current.humidity}%`}
          subtitle={humidityLevel}
        />
        
        <DetailItem
          label={locale === 'pt-BR' ? 'Vento' : 'Wind'}
          value={`${Math.round(data.current.windSpeed)} ${speedUnit}`}
          subtitle={`${windDirection} • ${windDesc}`}
        />
        
        <DetailItem
          label={locale === 'pt-BR' ? 'Pressão' : 'Pressure'}
          value={`${data.current.pressure} ${pressureUnit}`}
        />
        
        <DetailItem
          label={locale === 'pt-BR' ? 'Visibilidade' : 'Visibility'}
          value={formatVisibility(data.current.visibility)}
        />
        
        <DetailItem
          label={locale === 'pt-BR' ? 'Nuvens' : 'Cloud Cover'}
          value={`${data.current.cloudCover}%`}
        />
        
        <DetailItem
          label={locale === 'pt-BR' ? 'Sensação' : 'Feels Like'}
          value={`${Math.round(data.current.feelsLike)}°`}
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

