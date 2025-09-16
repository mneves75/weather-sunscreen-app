import React, { useMemo } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { weeklyForecast } from '../../src/data/mockForecast';
import { useTheme } from '../../src/theme/theme';

export default function ForecastDetails() {
  const params = useLocalSearchParams<{ day?: string; temp?: string }>();
  const { colors } = useTheme();

  const forecast = useMemo(() => {
    if (!params.day) return null;
    return weeklyForecast.find((item) => item.day === params.day);
  }, [params.day]);

  const title = params.day ?? 'Previsão';

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerLargeTitle: true,
          headerTransparent: true,
          presentation: 'card',
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          accessible
          accessibilityRole="summary"
        >
          <Text style={[styles.temperature, { color: colors.primary }]}>
            {forecast?.temp ?? params.temp ?? '--'}°C
          </Text>
          <Text style={[styles.summary, { color: colors.secondary }]}>
            {forecast?.summary ?? 'Previsão estendida indisponível.'}
          </Text>
          <Text style={{ color: colors.secondary, marginTop: 8 }}>
            Umidade: {forecast?.humidity ?? '--'}%
          </Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Horário x Condições</Text>
          {forecast?.hourly?.map((slot) => (
            <View
              key={slot.hour}
              style={[styles.hourlyRow, { borderBottomColor: colors.border }]}
              accessibilityRole="text"
            >
              <Text style={[styles.hourlyHour, { color: colors.primary }]}>{slot.hour}</Text>
              <Text style={[styles.hourlyTemp, { color: colors.secondary }]}>{slot.temp}°C</Text>
              <Text style={[styles.hourlyUV, { color: colors.secondary }]}>UV {slot.uv}</Text>
            </View>
          )) || (
            <Text style={{ color: colors.secondary }}>
              Dados horários serão carregados quando disponíveis.
            </Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  temperature: {
    fontSize: 64,
    fontWeight: '300',
  },
  summary: {
    fontSize: 18,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  hourlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hourlyHour: {
    fontSize: 16,
    fontWeight: '500',
  },
  hourlyTemp: {
    fontSize: 16,
  },
  hourlyUV: {
    fontSize: 14,
    fontWeight: '500',
  },
});
