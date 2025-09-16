import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/theme';
import { DailyForecast } from '../../types/weather';
import { LiquidGlassWrapper } from '../glass/LiquidGlassWrapper';

interface ForecastPreviewProps {
  forecast: DailyForecast[];
  onViewAllPress: () => void;
  style?: ViewStyle;
}

function ForecastPreview({ forecast, onViewAllPress, style }: ForecastPreviewProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (!forecast || forecast.length === 0) {
    return (
      <LiquidGlassWrapper variant="regular" style={[styles.container, style]}>
        <View style={styles.content}>
          <Text style={styles.noDataText}>Forecast data unavailable</Text>
        </View>
      </LiquidGlassWrapper>
    );
  }

  return (
    <LiquidGlassWrapper variant="regular" style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>3-Day Preview</Text>
          <Pressable onPress={onViewAllPress} accessibilityRole="button">
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>

        <View style={styles.forecastList}>
          {forecast.slice(0, 3).map((day, index) => (
            <ForecastItem
              key={day.date}
              forecast={day}
              isLast={index === Math.min(forecast.length - 1, 2)}
              colors={colors}
            />
          ))}
        </View>
      </View>
    </LiquidGlassWrapper>
  );
}

interface ForecastItemProps {
  forecast: DailyForecast;
  isLast: boolean;
  colors: any;
}

const ForecastItem = memo(function ForecastItem({ forecast, isLast, colors }: ForecastItemProps) {
  const itemStyles = createItemStyles(colors);

  // Format date to show day name
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      }
      if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      }
      return date.toLocaleDateString('en', { weekday: 'short' });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={[itemStyles.container, !isLast && itemStyles.withBorder]}>
      <View style={itemStyles.leftSection}>
        <Text style={itemStyles.dayText}>{formatDate(forecast.date)}</Text>
        <Text style={itemStyles.descriptionText} numberOfLines={1}>
          {forecast.description}
        </Text>
      </View>

      <View style={itemStyles.centerSection}>
        {forecast.icon ? (
          <Text
            style={itemStyles.weatherEmoji}
            accessibilityRole="image"
            accessibilityLabel={`Icon for ${forecast.description}`}
          >
            {forecast.icon}
          </Text>
        ) : null}
      </View>

      <View style={itemStyles.rightSection}>
        <View style={itemStyles.tempContainer}>
          <Text style={itemStyles.maxTemp}>{forecast.maxTemp}°</Text>
          <Text style={itemStyles.minTemp}>{forecast.minTemp}°</Text>
        </View>
        {forecast.precipitationChance > 0 && (
          <Text style={itemStyles.precipitationText}>{forecast.precipitationChance}%</Text>
        )}
      </View>
    </View>
  );
});

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      borderRadius: 16,
    },
    content: {
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
    },
    viewAllText: {
      fontSize: 14,
      color: colors.accent,
      fontWeight: '500',
    },
    forecastList: {
      gap: 0,
    },
    noDataText: {
      fontSize: 16,
      color: colors.secondary,
      textAlign: 'center',
      paddingVertical: 40,
    },
  });

const createItemStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      justifyContent: 'space-between',
    },
    withBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    leftSection: {
      flex: 2,
    },
    centerSection: {
      flex: 1,
      alignItems: 'center',
    },
    rightSection: {
      flex: 1,
      alignItems: 'flex-end',
    },
    dayText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 2,
    },
    descriptionText: {
      fontSize: 12,
      color: colors.secondary,
      textTransform: 'capitalize',
    },
    weatherEmoji: {
      fontSize: 24,
    },
    tempContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    maxTemp: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    minTemp: {
      fontSize: 16,
      color: colors.secondary,
    },
    precipitationText: {
      fontSize: 12,
      color: colors.accent,
      marginTop: 2,
    },
  });

export { ForecastPreview };
export default memo(ForecastPreview);
