import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/theme';
import { WeatherData } from '../../types/weather';
import { LiquidGlassWrapper } from '../glass/LiquidGlassWrapper';

interface WeatherSummaryCardProps {
  weatherData: WeatherData | null;
  style?: ViewStyle;
}

function WeatherSummaryCard({ weatherData, style }: WeatherSummaryCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (!weatherData) {
    return (
      <LiquidGlassWrapper variant="regular" style={[styles.container, style]}>
        <View style={styles.content}>
          <Text style={styles.noDataText}>No weather data available</Text>
        </View>
      </LiquidGlassWrapper>
    );
  }

  const { current } = weatherData;

  return (
    <LiquidGlassWrapper variant="regular" style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Current Weather</Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.temperatureSection}>
            <Text
              style={styles.temperature}
              accessibilityLabel={`Current temperature ${Math.round(current.temperature)} degrees Celsius`}
            >
              {Math.round(current.temperature)}°
            </Text>
            <Text style={styles.feelsLike}>Feels like {Math.round(current.feelsLike)}°</Text>
          </View>

          {current.icon && (
            <View style={styles.iconSection}>
              <Text
                style={styles.weatherEmoji}
                accessibilityRole="image"
                accessibilityLabel={`Weather icon ${current.description}`}
              >
                {current.icon}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.description}>
          <Text style={styles.conditionText}>{current.description}</Text>
        </View>

        <View style={styles.details}>
          <DetailItem
            label="Humidity"
            value={`${current.humidity}%`}
            colors={colors}
            styleSet={styles}
          />
          <DetailItem
            label="Wind"
            value={`${current.windSpeed} m/s`}
            colors={colors}
            styleSet={styles}
          />
          <DetailItem
            label="Visibility"
            value={`${current.visibility} km`}
            colors={colors}
            styleSet={styles}
          />
        </View>
      </View>
    </LiquidGlassWrapper>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
  colors: any;
  styleSet: ReturnType<typeof createStyles>;
}

const DetailItem = memo(function DetailItem({ label, value, colors, styleSet }: DetailItemProps) {
  return (
    <View style={[styleSet.detailItem, { borderColor: colors.border }]}>
      <Text style={[styleSet.detailLabel, { color: colors.secondary }]}>{label}</Text>
      <Text style={[styleSet.detailValue, { color: colors.primary }]}>{value}</Text>
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
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
    },
    mainContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    temperatureSection: {
      flex: 1,
    },
    temperature: {
      fontSize: 48,
      fontWeight: '300',
      color: colors.primary,
      lineHeight: 56,
    },
    feelsLike: {
      fontSize: 14,
      color: colors.secondary,
      marginTop: 4,
    },
    iconSection: {
      width: 80,
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
    },
    weatherEmoji: {
      fontSize: 52,
      lineHeight: 56,
    },
    description: {
      marginBottom: 16,
    },
    conditionText: {
      fontSize: 16,
      color: colors.secondary,
      textTransform: 'capitalize',
    },
    details: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    detailItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      borderRightWidth: StyleSheet.hairlineWidth,
      marginHorizontal: 4,
    },
    detailLabel: {
      fontSize: 12,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    noDataText: {
      fontSize: 16,
      color: colors.secondary,
      textAlign: 'center',
      paddingVertical: 40,
    },
  });

export { WeatherSummaryCard };
export default memo(WeatherSummaryCard);
