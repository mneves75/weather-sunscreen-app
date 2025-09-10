import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useWeather } from '../../src/context/WeatherContext';
import { LiquidGlassWrapper } from '../../src/components/glass/LiquidGlassWrapper';
import { useTheme } from '../../src/theme/theme';

export default function WeatherRoute() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { weatherData, isLoading, error, loadWeatherData, refreshWeatherData, clearError } =
    useWeather();

  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  const styles = createStyles(colors);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshWeatherData} />}
        contentInsetAdjustmentBehavior="automatic"
      >
        <LiquidGlassWrapper variant="thin" style={styles.headerCard}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.locationName}>
              {weatherData?.location.name ?? '—'}
            </Text>
            {weatherData?.location.country ? (
              <Text style={styles.country}>{weatherData.location.country}</Text>
            ) : null}
            {weatherData?.location ? (
              <Text style={styles.coordinates}>
                {weatherData.location.lat.toFixed(4)}°, {weatherData.location.lon.toFixed(4)}°
              </Text>
            ) : null}
          </View>
        </LiquidGlassWrapper>

        <View style={styles.currentWeather}>
          <Text style={styles.temperature} accessibilityLabel="Temperatura atual">
            {weatherData ? `${Math.round(weatherData.current.temperature)}°C` : '—'}
          </Text>
          <Text style={styles.description}>
            {weatherData?.current.description ?? t('weather.errorNoData')}
          </Text>
          {weatherData ? (
            <Text style={styles.feelsLike}>
              {t('weather.feelsLike', { temp: Math.round(weatherData.current.feelsLike) })}
            </Text>
          ) : null}
        </View>

        <LiquidGlassWrapper variant="regular" style={styles.detailsCard}>
          <View style={styles.detailsContent}>
            <Row
              label={t('weather.details.humidity')}
              value={weatherData ? `${weatherData.current.humidity}%` : '—'}
            />
            <Row
              label={t('weather.details.windSpeed')}
              value={weatherData ? `${weatherData.current.windSpeed} m/s` : '—'}
            />
            <Row
              label={t('weather.details.pressure')}
              value={weatherData ? `${weatherData.current.pressure} hPa` : '—'}
            />
            <Row
              label={t('weather.details.visibility')}
              value={weatherData ? `${weatherData.current.visibility} km` : '—'}
            />
          </View>
        </LiquidGlassWrapper>

        {error ? (
          <View
            accessibilityLiveRegion="polite"
            style={{ paddingHorizontal: 20, paddingBottom: 20 }}
          >
            <Text style={{ color: colors.error }}>{error}</Text>
            <Text
              onPress={() => {
                clearError();
                refreshWeatherData();
              }}
              accessibilityRole="button"
              style={{ color: colors.accent, marginTop: 8 }}
            >
              {' '}
              {t('common.retry')}{' '}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: { fontSize: 16, color: '#64748B' },
  value: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
});

function createStyles(colors: { [k: string]: string }) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { alignItems: 'center', paddingTop: 20, paddingHorizontal: 20 },
    headerCard: { marginHorizontal: 20, marginTop: 20, borderRadius: 12 },
    locationName: { fontSize: 28, fontWeight: '600', color: colors.primary, marginBottom: 4 },
    country: { fontSize: 16, color: colors.secondary, marginBottom: 4 },
    coordinates: { fontSize: 12, color: colors.secondary },
    currentWeather: { alignItems: 'center', paddingVertical: 40 },
    temperature: { fontSize: 64, fontWeight: '300', color: colors.primary, marginBottom: 8 },
    description: {
      fontSize: 18,
      color: colors.secondary,
      textTransform: 'capitalize',
      marginBottom: 8,
    },
    feelsLike: { fontSize: 16, color: colors.secondary },
    detailsCard: { marginHorizontal: 20, borderRadius: 12, marginBottom: 20 },
    detailsContent: { padding: 20 },
  });
}
