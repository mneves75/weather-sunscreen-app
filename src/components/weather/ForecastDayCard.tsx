/**
 * Single forecast day card component
 */

import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import { ForecastDay } from '@/src/types';
import { formatShortDate, getRelativeDayLabel, getWeatherEmoji } from '@/src/utils';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ForecastDayCardProps {
  day: ForecastDay;
  onPress?: () => void;
  locale?: string;
}

export const ForecastDayCard = React.memo<ForecastDayCardProps>(({ 
  day, 
  onPress,
  locale = 'en',
}) => {
  const colors = useColors();
  
  const dayLabel = getRelativeDayLabel(day.date, locale);
  const dateLabel = formatShortDate(day.date, locale);
  
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${dayLabel}. ${day.condition.description}. High ${Math.round(day.temperature.max)}, Low ${Math.round(day.temperature.min)} degrees. UV Index ${day.uvIndex.max}`}
    >
      <View style={styles.dateContainer}>
        <Text variant="body1" style={{ color: colors.onSurface }}>
          {dayLabel}
        </Text>
        <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
          {dateLabel}
        </Text>
      </View>
      
      <View style={styles.conditionContainer}>
        <Text style={styles.emoji}>{getWeatherEmoji(day.condition.wmoCode || 0)}</Text>
        <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
          {day.condition.main}
        </Text>
      </View>
      
      <View style={styles.temperatureContainer}>
        <Text variant="body1" style={{ color: colors.primary }}>
          {Math.round(day.temperature.max)}°
        </Text>
        <Text variant="body2" style={{ color: colors.onSurfaceVariant }}>
          {Math.round(day.temperature.min)}°
        </Text>
      </View>
      
      <View style={styles.uvContainer}>
        <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
          UV
        </Text>
        <Text variant="body2" style={{ color: colors.onSurface }}>
          {day.uvIndex.max}
        </Text>
      </View>
      
      {day.precipitation.probability > 0 && (
        <View style={styles.precipContainer}>
          <Text style={styles.rainEmoji}>💧</Text>
          <Text variant="caption" style={{ color: colors.primary }}>
            {Math.round(day.precipitation.probability)}%
          </Text>
        </View>
      )}
    </Container>
  );
});

ForecastDayCard.displayName = 'ForecastDayCard';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
    gap: 12,
  },
  dateContainer: {
    flex: 2,
    gap: 2,
  },
  conditionContainer: {
    flex: 1.5,
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 32,
  },
  temperatureContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uvContainer: {
    flex: 0.8,
    alignItems: 'center',
    gap: 2,
  },
  precipContainer: {
    flex: 0.7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  rainEmoji: {
    fontSize: 16,
  },
});

