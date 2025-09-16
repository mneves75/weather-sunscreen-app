import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../src/theme/theme';
import { tokens } from '../../src/theme/tokens';

type UVRow = { time: string; uv: number };

export default function UVIndexRoute() {
  const { colors } = useTheme();
  const data: UVRow[] = Array.from({ length: 24 }, (_, h) => ({
    time: `${h}:00`,
    uv: Math.max(0, 12 - Math.abs(12 - h)),
  }));
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/icon.png')}
          style={{ width: 48, height: 48, borderRadius: 10 }}
          contentFit="cover"
          accessibilityIgnoresInvertColors
        />
        <Text accessibilityRole="header" style={styles.title}>
          UV Index
        </Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(it) => it.time}
        initialNumToRender={12}
        windowSize={10}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.time}>{item.time}</Text>
            <Text style={[styles.uv, { color: scoreColor(item.uv) }]}>UV {item.uv.toFixed(0)}</Text>
          </View>
        )}
        getItemLayout={(_, i) => ({ length: 52, offset: 52 * i, index: i })}
      />
    </View>
  );
}

function scoreColor(uv: number) {
  if (uv >= 11) return '#7e22ce';
  if (uv >= 8) return '#b91c1c';
  if (uv >= 6) return '#ca8a04';
  if (uv >= 3) return '#16a34a';
  return '#0891b2';
}

function createStyles(colors: { [K in keyof typeof tokens.light.colors]: string }) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    title: { fontSize: 24, fontWeight: '700', color: colors.primary },
    row: {
      height: 52,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    time: { color: colors.secondary },
    uv: { fontWeight: '700' },
  });
}
