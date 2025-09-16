import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useWeather } from '../../src/context/WeatherContext';
import { LiquidGlassWrapper } from '../../src/components/glass/LiquidGlassWrapper';
import { useTheme } from '../../src/theme/theme';
import { tokens } from '../../src/theme/tokens';

export default function WeatherRoute() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { weatherData, isLoading, error, loadWeatherData, refreshWeatherData, clearError } =
    useWeather();

  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  const styles = createStyles(colors);
  const detailRowStyles = useMemo(() => createDetailRowStyles(colors), [colors]);

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
              styles={detailRowStyles}
            />
            <Row
              label={t('weather.details.windSpeed')}
              value={weatherData ? `${weatherData.current.windSpeed} m/s` : '—'}
              styles={detailRowStyles}
            />
            <Row
              label={t('weather.details.pressure')}
              value={weatherData ? `${weatherData.current.pressure} hPa` : '—'}
              styles={detailRowStyles}
            />
            <Row
              label={t('weather.details.visibility')}
              value={weatherData ? `${weatherData.current.visibility} km` : '—'}
              styles={detailRowStyles}
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

type DetailRowStyles = ReturnType<typeof createDetailRowStyles>;

function Row({ label, value, styles }: { label: string; value: string; styles: DetailRowStyles }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

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

function createDetailRowStyles(colors: { [K in keyof typeof tokens.light.colors]: string }) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.cardBorder,
    },
    label: { fontSize: 16, color: colors.secondary } as TextStyle,
    value: { fontSize: 16, fontWeight: '600', color: colors.primary } as TextStyle,
  });
}
