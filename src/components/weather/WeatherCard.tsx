/**
 * Main weather display card component
 */

import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import { WeatherData } from '@/src/types';
import { formatTime, getWeatherEmoji } from '@/src/utils';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface WeatherCardProps {
  data: WeatherData;
  onPress?: () => void;
  showLastUpdated?: boolean;
}

export const WeatherCard = React.memo<WeatherCardProps>(({ 
  data, 
  onPress,
  showLastUpdated = true,
}) => {
  const colors = useColors();
  
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`Weather for ${data.location.city}. Temperature ${Math.round(data.current.temperature)} degrees. ${data.current.condition.description}`}
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
            {Math.round(data.current.temperature)}°
          </Text>
          <Text variant="body1" style={{ color: colors.onSurfaceVariant }}>
            Feels like {Math.round(data.current.feelsLike)}°
          </Text>
        </View>
        
        <View style={styles.conditionContainer}>
          <Text style={styles.emoji}>
            {getWeatherEmoji(data.current.condition.wmoCode || 0)}
          </Text>
          <Text variant="body1" style={{ color: colors.onSurface }}>
            {data.current.condition.description}
          </Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
            Humidity
          </Text>
          <Text variant="body2" style={{ color: colors.onSurface }}>
            {data.current.humidity}%
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
            Wind
          </Text>
          <Text variant="body2" style={{ color: colors.onSurface }}>
            {Math.round(data.current.windSpeed)} km/h
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
            Pressure
          </Text>
          <Text variant="body2" style={{ color: colors.onSurface }}>
            {data.current.pressure} hPa
          </Text>
        </View>
      </View>
      
      {showLastUpdated && (
        <Text variant="caption" style={[styles.timestamp, { color: colors.onSurfaceVariant }]}>
          Updated {formatTime(data.current.timestamp)}
        </Text>
      )}
    </Container>
  );
});

WeatherCard.displayName = 'WeatherCard';

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
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
    lineHeight: 72,
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
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
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

