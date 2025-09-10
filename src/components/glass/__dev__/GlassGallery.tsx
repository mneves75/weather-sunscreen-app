import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../../context/ThemeContext';
import { LiquidGlassWrapper } from '../LiquidGlassWrapper';

export function GlassGallery() {
  const colors = useColors();
  const variants: Array<NonNullable<Parameters<typeof LiquidGlassWrapper>[0]['variant']>> = [
    'regular',
    'prominent',
    'thin',
    'glass',
    'glassProminent',
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.primary }]}>Glass Variants</Text>
      {variants.map((v) => (
        <LiquidGlassWrapper key={v} variant={v} style={styles.card}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>{v}</Text>
            <Text style={{ color: colors.secondary }}>This is a sample glass card ({v}).</Text>
          </View>
        </LiquidGlassWrapper>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  card: { padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
});

export default GlassGallery;
