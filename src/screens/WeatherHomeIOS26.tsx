import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LiquidGlassIOS26, LiquidGlassListItem } from '../components/glass/LiquidGlassIOS26';
import { useColors, useTheme } from '../context/ThemeContext';
import { WeatherService } from '../services/weatherService';
import { WeatherIcon } from '../components/icons/WeatherIcon';
import { UVIcon } from '../components/icons/UVIcon';
import { logger } from '../services/loggerService';

const { width, height } = Dimensions.get('window');

export function WeatherHomeIOS26() {
  const colors = useColors();
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      logger.info('Loading weather data for iOS 26');

      const data = await WeatherService.getCurrentWeatherData();
      setLocation({
        city: data.location.name,
        region: '',
        country: data.location.country,
      });
      setWeather({
        temperature: data.current.temperature,
        feelsLike: data.current.feelsLike,
        humidity: data.current.humidity,
        windSpeed: data.current.windSpeed,
        description: data.current.description,
        uvIndex: data.uvIndex.value,
      });
      setForecast(data.forecast);

      logger.info('Weather data loaded successfully');
    } catch (error) {
      logger.error('Failed to load weather data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWeatherData();
  };

  const isIOS26 = Platform.OS === 'ios' && parseFloat(Platform.Version) >= 26;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#0F2027', '#203A43', '#2C5364'] : ['#4A90E2', '#7BB6ED', '#A8D0F0']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Main Weather Card with Ultra Liquid Glass */}
        <LiquidGlassIOS26
          variant="ultra"
          intensity={90}
          dynamicBlur={true}
          parallaxEnabled={true}
          hapticFeedback={true}
          style={styles.mainCard}
        >
          <View style={styles.weatherHeader}>
            <Text style={[styles.locationText, { color: colors.primary }]}>
              {location?.city || 'Loading...'}
            </Text>
            <Text style={[styles.locationSubtext, { color: colors.secondary }]}>
              {location?.region}, {location?.country}
            </Text>
          </View>

          {weather && (
            <>
              <View style={styles.temperatureContainer}>
                <Text style={[styles.temperature, { color: colors.primary }]}>
                  {Math.round(weather.temperature)}°
                </Text>
                <WeatherIcon size={80} color={colors.temperature} />
              </View>

              <Text style={[styles.weatherDescription, { color: colors.primary }]}>
                {weather.description}
              </Text>

              <View style={styles.weatherDetails}>
                <LiquidGlassIOS26 variant="thin" intensity={60} style={styles.detailCard}>
                  <Text style={[styles.detailLabel, { color: colors.secondary }]}>Feels Like</Text>
                  <Text style={[styles.detailValue, { color: colors.primary }]}>
                    {Math.round(weather.feelsLike)}°
                  </Text>
                </LiquidGlassIOS26>

                <LiquidGlassIOS26 variant="thin" intensity={60} style={styles.detailCard}>
                  <Text style={[styles.detailLabel, { color: colors.secondary }]}>Humidity</Text>
                  <Text style={[styles.detailValue, { color: colors.primary }]}>
                    {weather.humidity}%
                  </Text>
                </LiquidGlassIOS26>

                <LiquidGlassIOS26 variant="thin" intensity={60} style={styles.detailCard}>
                  <Text style={[styles.detailLabel, { color: colors.secondary }]}>Wind</Text>
                  <Text style={[styles.detailValue, { color: colors.primary }]}>
                    {Math.round(weather.windSpeed)} km/h
                  </Text>
                </LiquidGlassIOS26>
              </View>
            </>
          )}
        </LiquidGlassIOS26>

        {/* UV Index Card with Prominent Liquid Glass */}
        <LiquidGlassIOS26
          variant="prominent"
          intensity={85}
          dynamicBlur={true}
          parallaxEnabled={true}
          style={styles.uvCard}
        >
          <View style={styles.uvHeader}>
            <UVIcon size={32} color={colors.primary} />
            <Text style={[styles.uvTitle, { color: colors.primary }]}>UV Index</Text>
          </View>

          {weather && (
            <>
              <Text style={[styles.uvValue, { color: getUVColor(weather.uvIndex) }]}>
                {weather.uvIndex}
              </Text>
              <Text style={[styles.uvLevel, { color: colors.primary }]}>
                {getUVLevel(weather.uvIndex)}
              </Text>
              <Text style={[styles.uvRecommendation, { color: colors.secondary }]}>
                {getUVRecommendation(weather.uvIndex)}
              </Text>
            </>
          )}
        </LiquidGlassIOS26>

        {/* Forecast with Adaptive Liquid Glass */}
        <LiquidGlassIOS26 variant="adaptive" intensity={75} style={styles.forecastContainer}>
          <Text style={[styles.forecastTitle, { color: colors.primary }]}>7-Day Forecast</Text>

          {forecast.map((day, index) => (
            <LiquidGlassListItem
              key={index}
              style={styles.forecastItem}
              onPress={() => logger.info('Forecast day pressed', { day: day.date })}
            >
              <View style={styles.forecastRow}>
                <Text style={[styles.forecastDay, { color: colors.primary }]}>
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </Text>
                <WeatherIcon size={24} color={colors.temperature} />
                <View style={styles.forecastTemps}>
                  <Text style={[styles.forecastTempHigh, { color: colors.primary }]}>
                    {Math.round(day.maxTemp)}°
                  </Text>
                  <Text style={[styles.forecastTempLow, { color: colors.secondary }]}>
                    {Math.round(day.minTemp)}°
                  </Text>
                </View>
                <View style={styles.forecastUV}>
                  <UVIcon size={16} color={getUVColor(day.uvIndex)} />
                  <Text style={[styles.forecastUVText, { color: getUVColor(day.uvIndex) }]}>
                    {day.uvIndex}
                  </Text>
                </View>
              </View>
            </LiquidGlassListItem>
          ))}
        </LiquidGlassIOS26>

        {/* iOS 26 Badge */}
        {isIOS26 && (
          <LiquidGlassIOS26 variant="ultra" intensity={95} style={styles.ios26Badge}>
            <Text style={[styles.ios26Text, { color: colors.primary }]}>Optimized for iOS 26</Text>
            <Text style={[styles.ios26Subtext, { color: colors.secondary }]}>
              Liquid Glass UI • Haptic Feedback • Motion Parallax
            </Text>
          </LiquidGlassIOS26>
        )}
      </ScrollView>
    </View>
  );
}

// Helper functions
function getUVColor(uvIndex: number): string {
  if (uvIndex <= 2) return '#4CAF50';
  if (uvIndex <= 5) return '#FFC107';
  if (uvIndex <= 7) return '#FF9800';
  if (uvIndex <= 10) return '#F44336';
  return '#9C27B0';
}

function getUVLevel(uvIndex: number): string {
  if (uvIndex <= 2) return 'Low';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very High';
  return 'Extreme';
}

function getUVRecommendation(uvIndex: number): string {
  if (uvIndex <= 2) return 'No protection needed';
  if (uvIndex <= 5) return 'Wear sunscreen SPF 30+';
  if (uvIndex <= 7) return 'Wear sunscreen SPF 50+, seek shade';
  if (uvIndex <= 10) return 'Take all precautions, avoid sun 10am-4pm';
  return 'Avoid sun exposure, stay indoors if possible';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  mainCard: {
    padding: 24,
    marginBottom: 20,
  },
  weatherHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationSubtext: {
    fontSize: 16,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  temperature: {
    fontSize: 72,
    fontWeight: '300',
    marginRight: 20,
  },
  weatherDescription: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailCard: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  uvCard: {
    padding: 20,
    marginBottom: 20,
  },
  uvHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  uvTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  uvValue: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  uvLevel: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  uvRecommendation: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  forecastContainer: {
    padding: 20,
    marginBottom: 20,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  forecastItem: {
    marginBottom: 8,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forecastDay: {
    fontSize: 16,
    fontWeight: '500',
    width: 50,
  },
  forecastTemps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  forecastTempHigh: {
    fontSize: 16,
    fontWeight: '600',
  },
  forecastTempLow: {
    fontSize: 16,
  },
  forecastUV: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  forecastUVText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ios26Badge: {
    padding: 16,
    alignItems: 'center',
  },
  ios26Text: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  ios26Subtext: {
    fontSize: 12,
  },
});
