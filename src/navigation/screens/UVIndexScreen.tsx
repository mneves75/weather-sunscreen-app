import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useWeather } from '../../context/WeatherContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export function UVIndexScreen() {
  const { weatherData, isLoading, error, refreshWeatherData, clearError } = useWeather();

  if (isLoading && !weatherData) {
    return <LoadingSpinner message="Loading UV index data..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={() => {
          clearError();
          refreshWeatherData();
        }} 
      />
    );
  }

  if (!weatherData?.uvIndex) {
    return (
      <ErrorMessage 
        message="No UV index data available" 
        onRetry={refreshWeatherData}
      />
    );
  }

  const { uvIndex } = weatherData;
  const uvColor = getUVColor(uvIndex.value);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refreshWeatherData} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>UV Index</Text>
        <Text style={styles.location}>{weatherData.location.name}</Text>
        <Text style={styles.country}>{weatherData.location.country}</Text>
      </View>

      <View style={[styles.uvCard, { borderLeftColor: uvColor }]}>
        <Text style={[styles.uvValue, { color: uvColor }]}>{uvIndex.value}</Text>
        <Text style={[styles.uvLevel, { color: uvColor }]}>{uvIndex.level}</Text>
        <Text style={styles.uvDescription}>
          Today's maximum: {uvIndex.maxToday} at {uvIndex.peakTime}
        </Text>
      </View>

      <View style={styles.recommendationCard}>
        <Text style={styles.recommendationTitle}>Sunscreen Recommendation</Text>
        <Text style={styles.spfRecommendation}>
          SPF {uvIndex.sunscreenRecommendation.spf}+
        </Text>
        <Text style={styles.frequency}>
          Reapply {uvIndex.sunscreenRecommendation.applicationFrequency}
        </Text>
        
        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Additional Tips:</Text>
          {uvIndex.sunscreenRecommendation.additionalTips.map((tip, index) => (
            <Text key={index} style={styles.tip}>• {tip}</Text>
          ))}
        </View>
      </View>

      <View style={styles.skinTypeCard}>
        <Text style={styles.skinTypeTitle}>Recommendations by Skin Type</Text>
        <View style={styles.skinTypeRow}>
          <Text style={styles.skinTypeLabel}>Fair Skin:</Text>
          <Text style={styles.skinTypeValue}>{uvIndex.sunscreenRecommendation.skinTypeRecommendations.fair}</Text>
        </View>
        <View style={styles.skinTypeRow}>
          <Text style={styles.skinTypeLabel}>Medium Skin:</Text>
          <Text style={styles.skinTypeValue}>{uvIndex.sunscreenRecommendation.skinTypeRecommendations.medium}</Text>
        </View>
        <View style={styles.skinTypeRow}>
          <Text style={styles.skinTypeLabel}>Dark Skin:</Text>
          <Text style={styles.skinTypeValue}>{uvIndex.sunscreenRecommendation.skinTypeRecommendations.dark}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function getUVColor(uvValue: number): string {
  if (uvValue <= 2) return '#289D00'; // Low - Green
  if (uvValue <= 5) return '#F7D908'; // Moderate - Yellow
  if (uvValue <= 7) return '#F85D00'; // High - Orange
  if (uvValue <= 10) return '#E90B00'; // Very High - Red
  return '#B33DAD'; // Extreme - Violet
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  location: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 2,
  },
  country: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  uvCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    borderLeftWidth: 6,
  },
  uvValue: {
    fontSize: 64,
    fontWeight: '700',
    marginBottom: 8,
  },
  uvLevel: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  uvDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  recommendationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  spfRecommendation: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 8,
  },
  frequency: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
  },
  tips: {
    marginTop: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  tip: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
    lineHeight: 20,
  },
  skinTypeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  skinTypeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  skinTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  skinTypeLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    flex: 1,
  },
  skinTypeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 2,
    textAlign: 'right',
  },
});