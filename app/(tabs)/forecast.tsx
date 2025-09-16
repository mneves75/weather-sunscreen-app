import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../src/theme/theme';
import { tokens } from '../../src/theme/tokens';

type ForecastRow = { day: string; temp: number; icon: ImageSourcePropType };

export default function ForecastRoute() {
  const { colors } = useTheme();
  const data = useMemo<ForecastRow[]>(
    () => [
      { day: 'Today', temp: 26, icon: require('../../assets/icon.png') },
      { day: 'Tomorrow', temp: 24, icon: require('../../assets/icon.png') },
      { day: 'Day 3', temp: 22, icon: require('../../assets/icon.png') },
      { day: 'Day 4', temp: 20, icon: require('../../assets/icon.png') },
      { day: 'Day 5', temp: 23, icon: require('../../assets/icon.png') },
      { day: 'Day 6', temp: 25, icon: require('../../assets/icon.png') },
      { day: 'Day 7', temp: 27, icon: require('../../assets/icon.png') },
    ],
    [],
  );

  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        7-day Forecast
      </Text>
      <FlatList
        data={data}
        keyExtractor={(it) => it.day}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Image
                source={item.icon}
                style={{ width: 28, height: 28, borderRadius: 6 }}
                contentFit="cover"
              />
              <Text style={styles.day}>{item.day}</Text>
            </View>
            <Text style={styles.temp}>{item.temp}°C</Text>
          </View>
        )}
        getItemLayout={(_, i) => ({ length: 56, offset: 56 * i, index: i })}
      />
    </View>
  );
}

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
    },
    day: { color: colors.primary, fontWeight: '600' },
    temp: { color: colors.secondary, fontWeight: '600' },
  });
}
