/**
 * Custom hook for accessing and managing UV index data
 */

import { useSettings } from '@/src/context/SettingsContext';
import { useWeather } from '@/src/context/WeatherContext';
import {
    getSPFRecommendation,
    getUVLevelColor,
    getUVLevelLabel,
    getUVRecommendations,
} from '@/src/utils';
import { useMemo } from 'react';

export function useUVIndex() {
  const {
    uvIndex,
    isLoadingUV,
    uvError,
    refreshUV,
    currentLocation,
  } = useWeather();

  const { preferences } = useSettings();
  
  // Get personalized SPF recommendation
  const spfRecommendation = useMemo(() => {
    if (!uvIndex) return null;
    return getSPFRecommendation(uvIndex.value, preferences.skinType);
  }, [uvIndex, preferences.skinType]);
  
  // Get personalized recommendations
  const recommendations = useMemo(() => {
    if (!uvIndex) return [];
    return getUVRecommendations(
      uvIndex.value,
      preferences.skinType,
      preferences.locale
    );
  }, [uvIndex, preferences.skinType, preferences.locale]);
  
  // Get UV level color
  const uvLevelColor = useMemo(() => {
    if (!uvIndex) return null;
    return getUVLevelColor(uvIndex.level);
  }, [uvIndex]);
  
  // Get UV level label
  const uvLevelLabel = useMemo(() => {
    if (!uvIndex) return '';
    return getUVLevelLabel(uvIndex.level, preferences.locale);
  }, [uvIndex, preferences.locale]);

  const hourly = useMemo(() => {
    if (!uvIndex) return [];
    return uvIndex.hourly
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [uvIndex]);

  const upcomingHourly = useMemo(() => {
    if (!hourly.length) return [];
    const now = Date.now();
    return hourly.filter(point => point.timestamp >= now - 60 * 60 * 1000);
  }, [hourly]);

  // Prefer upcoming points, but fall back to the raw set when API data is stale (e.g., overnight).
  const displayHourly = upcomingHourly.length > 0 ? upcomingHourly : hourly;

  return {
    uvIndex,
    isLoading: isLoadingUV,
    error: uvError,
    refresh: refreshUV,
    hasLocation: !!currentLocation,
    
    // Computed values
    spfRecommendation,
    recommendations,
    uvLevelColor,
    uvLevelLabel,
    hourly,
    upcomingHourly,
    displayHourly,

    // User preferences
    skinType: preferences.skinType,
    locale: preferences.locale,
  };
}
