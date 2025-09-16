import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '../../src/theme/theme';
import { tokens } from '../../src/theme/tokens';
import { FlashList } from '@shopify/flash-list';
import { weeklyForecast } from '../../src/data/mockForecast';
import { logger } from '../../src/services/loggerService';

type ForecastRow = {
  day: string;
  temp: number;
  icon: string;
  summary: string;
  humidity: number;
};

export default function ForecastRoute() {
  const { colors } = useTheme();
  const data = useMemo<ForecastRow[]>(() => {
    const mapped = weeklyForecast.map(({ day, temp, summary, humidity, icon }) => ({
      day,
      temp,
      summary,
      humidity,
      icon,
    }));
    logger.info('ForecastRoute: prepared forecast data', { count: mapped.length });
    return mapped;
  }, []);

  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        7-day Forecast
      </Text>
      <FlashList
        data={data}
        keyExtractor={(it) => it.day}
        renderItem={({ item }) => <ForecastRowItem item={item} styles={styles} />}
        getItemType={() => 'forecast-row'}
        onLoad={({ elapsedTimeInMs }) =>
          logger.info('ForecastRoute: initial draw complete', { elapsedTimeInMs })
        }
      />
    </View>
  );
}

const ForecastRowItem = memo(
  ({ item, styles }: { item: ForecastRow; styles: ReturnType<typeof createStyles> }) => (
    <Link
      href={{ pathname: '/forecast/[day]', params: { day: item.day, temp: String(item.temp) } }}
      asChild
      prefetch
    >
      <Pressable style={styles.row} accessibilityHint={`Abrir detalhes de ${item.day}`}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text
            style={styles.iconEmoji}
            accessibilityRole="image"
            accessibilityLabel={item.summary}
          >
            {item.icon}
          </Text>
          <View>
            <Text style={styles.day}>{item.day}</Text>
            <Text style={styles.summary} numberOfLines={1}>
              {item.summary}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.temp}>{item.temp}°C</Text>
          <Text style={styles.humidity}>Umidade {item.humidity}%</Text>
        </View>
      </Pressable>
    </Link>
  ),
);

ForecastRowItem.displayName = 'ForecastRowItem';

function createStyles(colors: { [K in keyof typeof tokens.light.colors]: string }) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    title: { fontSize: 24, fontWeight: '700', color: colors.primary, marginBottom: 8 },
    row: {
      height: 56,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: 4,
    },
    day: { color: colors.primary, fontWeight: '600' },
    summary: { color: colors.secondary, fontSize: 12 },
    temp: { color: colors.secondary, fontWeight: '600' },
    humidity: { color: colors.secondary, fontSize: 12 },
    iconEmoji: { fontSize: 24 },
  });
}
