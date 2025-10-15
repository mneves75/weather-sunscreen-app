/**
 * UV Index Screen
 * UV index monitoring with SPF recommendations
 *
 * Modernized with:
 * - Hero animated circular progress for UV index
 * - Spring entrance animations
 * - Interactive glass skin selector card
 * - AI-powered SPF recommendations with glass panels
 * - Educational info section with glass effect
 * - Platform-adaptive Material fallbacks
 */

import { Button, CircularProgress, Container, ErrorView, LoadingSpinner, Text } from '@/src/components/ui';
import { DaylightSection, SkinTypeSelector, UVRecommendations } from '@/src/components/weather';
import { UVHourlyChart } from '@/src/components/weather/UVHourlyChart';
import { UVHourlySparkline } from '@/src/components/weather/UVHourlySparkline';
import { useSettings } from '@/src/context/SettingsContext';
import { useDaylight, useLocation, useUVIndex, useWeatherData } from '@/src/hooks';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useColors, useGlassAvailability } from '@/src/theme';
import { tokens } from '@/src/theme/tokens';
import { createSlideUpComponent } from '@/src/theme/animations';
import { GlassView } from 'expo-glass-effect';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Animated, Linking, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { getUVLevelLabel } from '@/src/utils';

const { spacing, borderRadius } = tokens;

export default function UVIndexScreen() {
  const colors = useColors();
  const { canUseGlass } = useGlassAvailability();
  const { preferences, updatePreference } = useSettings();
  const { t } = useTranslation();
  const { trigger: triggerHaptic } = useHaptics();
  const {
    uvIndex,
    uvLevelLabel,
    spfRecommendation,
    recommendations,
    isLoading,
    error,
    refresh,
    skinType,
    hasLocation,
    hourly,
    upcomingHourly,
    displayHourly,
  } = useUVIndex();
// Snapshot of broader weather data (temperature, city name, etc.) used for contextual copy.
const { weatherData: weatherSnapshot } = useWeatherData();
  const locationState = useLocation();
  const {
    currentLocation,
    permissionStatus,
    isRequesting: isRequestingLocation,
    getCurrentLocation,
  } = locationState;
  const {
    day: daylightDay,
    daylight,
    peakUV: peakDayUV,
  } = useDaylight();
  const sunrise = daylight?.sunrise ?? '';
  const sunset = daylight?.sunset ?? '';
  const solarNoon = daylight?.solarNoon ?? '';
  const daylightDurationMinutes = daylight?.daylightDuration ?? 0;
  const peakUVValue = peakDayUV ?? daylightDay?.uvIndex.max;
  const hasDaylightData = Boolean(sunrise && sunset);

  // Check for reduce motion accessibility preference
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );

    return () => subscription?.remove();
  }, []);

  // Entrance animations
  const uvCardAnim = createSlideUpComponent(50, 50);
  const skinCardAnim = createSlideUpComponent(50, 100);
  const hourlyAnim = createSlideUpComponent(50, 150);
  const recommendationsAnim = createSlideUpComponent(50, 200);
  const daylightAnim = createSlideUpComponent(50, 250);

  // Trigger entrance animations when data loads
  useEffect(() => {
    if (uvIndex) {
      if (reduceMotion) {
        uvCardAnim.opacity.setValue(1);
        uvCardAnim.translateY.setValue(0);
      } else {
        uvCardAnim.animate();
      }
    }
    // Animation objects are stable references from createSlideUpComponent
  }, [uvIndex, reduceMotion]);

  useEffect(() => {
    if (skinType) {
      if (reduceMotion) {
        skinCardAnim.opacity.setValue(1);
        skinCardAnim.translateY.setValue(0);
      } else {
        skinCardAnim.animate();
      }
    }
    // Animation objects are stable references from createSlideUpComponent
  }, [skinType, reduceMotion]);

  useEffect(() => {
    if (recommendations.length > 0) {
      if (reduceMotion) {
        recommendationsAnim.opacity.setValue(1);
        recommendationsAnim.translateY.setValue(0);
      } else {
        recommendationsAnim.animate();
      }
    }
    // Animation objects are stable references from createSlideUpComponent
  }, [recommendations, reduceMotion, recommendationsAnim]);

  useEffect(() => {
    if (hourlyPreview.length > 1) {
      if (reduceMotion) {
        hourlyAnim.opacity.setValue(1);
        hourlyAnim.translateY.setValue(0);
      } else {
        hourlyAnim.animate();
      }
    }
    // Animation objects are stable references from createSlideUpComponent
  }, [hourlyPreview, reduceMotion, hourlyAnim]);

  useEffect(() => {
    if (hasDaylightData) {
      if (reduceMotion) {
        daylightAnim.opacity.setValue(1);
        daylightAnim.translateY.setValue(0);
      } else {
        daylightAnim.animate();
      }
    }
    // Animation objects are stable references from createSlideUpComponent
  }, [hasDaylightData, reduceMotion, daylightAnim]);

  const isLocationAvailable = hasLocation || locationState.hasLocation || Boolean(currentLocation);
  const shouldShowLocationPrompt = !isLocationAvailable && !uvIndex && !isLoading;
  // Guard flag ensures we don't spam the weather service every time the screen refocuses.
  // Prevent repeated fetches when the screen re-focuses rapidly (e.g., tab switches).
  const focusFetchGuard = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!isLocationAvailable) {
        focusFetchGuard.current = false;
        return;
      }

      if (uvIndex || isLoading) {
        focusFetchGuard.current = false;
        return;
      }

      if (focusFetchGuard.current) {
        return;
      }

      focusFetchGuard.current = true;
      refresh().catch(() => {
        focusFetchGuard.current = false;
      });

      // Cleanup: reset guard on blur to prevent stale state across remounts
      return () => {
        focusFetchGuard.current = false;
      };
    }, [isLocationAvailable, isLoading, refresh, uvIndex])
  );

  const handleRefresh = useCallback(() => {
    // Reset guard to allow pull-to-refresh even if guard-triggered fetch previously failed
    focusFetchGuard.current = false;
    refresh();
  }, [refresh]);

  const handleLocationRequest = useCallback(async () => {
    triggerHaptic('light');

    if (permissionStatus === 'denied') {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
      return;
    }

    try {
      await getCurrentLocation({ promptForServices: true });
      // Reset guard so next focus can fetch if needed
      // Note: WeatherContext auto-refreshes when location changes, so no manual refresh needed
      focusFetchGuard.current = false;
    } catch {
      // Surface handled by useLocation error state; no additional action needed
    }
  }, [getCurrentLocation, permissionStatus, triggerHaptic]);

  // Show location request only when we have neither location nor UV data to display.
  if (shouldShowLocationPrompt) {
    return (
      <Container style={styles.centerContainer}>
        <Text variant="h2" style={[styles.locationTitle, { color: colors.onBackground }]}>
          {t('uv.locationRequiredTitle', 'Turn on Location Services')}
        </Text>
        <Text variant="body1" style={[styles.locationMessage, { color: colors.onSurfaceVariant }]}>
          {t('uv.locationRequiredDescription', 'Enable location access so we can calculate the UV index for where you are.')}
        </Text>
        <Button
          title={
            permissionStatus === 'denied'
              ? t('location.openSettings', 'Open Settings')
              : t('location.allowLocation', 'Allow Location Access')
          }
          onPress={handleLocationRequest}
          loading={isRequestingLocation}
          disabled={isRequestingLocation}
          variant="tonal"
        />
      </Container>
    );
  }
  
  // Show loading on first load
  if (isLoading && !uvIndex) {
    return (
      <Container style={styles.centerContainer}>
        <LoadingSpinner message={t('common.loading')} />
      </Container>
    );
  }
  
  // Show error if data failed to load
  if (error && !uvIndex) {
    return (
      <Container style={styles.centerContainer}>
        <ErrorView
          message={t('errors.uvData', 'Unable to load UV index data')}
          onRetry={refresh}
        />
      </Container>
    );
  }

  // Final fallback: show error if no UV data available after all checks
  if (!uvIndex) {
    return (
      <Container style={styles.centerContainer}>
        <ErrorView
          message={t('errors.uvData', 'Unable to load UV index data')}
          onRetry={refresh}
        />
      </Container>
    );
  }

  const resolvedSpf = spfRecommendation ?? 30;
  const hasExplicitSpfRecommendation = spfRecommendation !== null && spfRecommendation !== undefined;
  // Limit detailed display to the next 12 readings for readability; hook already sorts ascending.
  const hourlyPreview = useMemo(() => displayHourly.slice(0, 12), [displayHourly]);
  const formatHour = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(preferences.locale, {
      hour: 'numeric',
      hour12: preferences.timeFormat !== '24h',
    });
  }, [preferences.locale, preferences.timeFormat]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Hero UV Index with Animated Circular Progress */}
      <Animated.View
        style={{
          opacity: uvCardAnim.opacity,
          transform: [{ translateY: uvCardAnim.translateY }],
        }}
      >
        {canUseGlass ? (
          <GlassView
            style={styles.heroCard}
            glassEffectStyle="regular"
            tintColor={colors.surfaceTint}
            accessibilityRole="alert"
            accessibilityLabel={`UV Index: ${uvIndex.value}, ${uvLevelLabel}. SPF ${resolvedSpf}+ ${t('uv.protection', 'Protection recommended')}`}
          >
            <View style={styles.heroContent}>
              <Text variant="h2" style={[styles.heroTitle, { color: colors.onSurface }]}> 
                {t('uv.currentIndex', 'Current UV Index')}
              </Text>
              {weatherSnapshot?.location?.city && (
                <Text variant="body2" style={{ color: colors.onSurfaceVariant }}>
                  {t('uv.locationSubtitle', 'Based on conditions in {{city}}', {
                    city: weatherSnapshot.location.city,
                  })}
                </Text>
              )}

              <CircularProgress
                value={uvIndex.value}
                max={11}
                size={240}
                trackWidth={16}
                gradient={['#30D158', '#FFD60A', '#FF9F0A', '#FF453A', '#BF5AF2']}
              >
                <View style={styles.uvProgressCenter}>
                  <Text variant="h1" style={{ color: colors.onSurface, fontSize: 76, fontWeight: '200' }}>
                    {uvIndex.value}
                  </Text>
                  <Text variant="h3" style={{ color: colors.primary, marginTop: spacing.xs, fontWeight: '600' }}>
                    {uvLevelLabel}
                  </Text>
                  <Text variant="body2" style={{ color: colors.onSurfaceVariant, marginTop: spacing.sm }}>
                    {t('uv.protection', 'Protection recommended')}
                  </Text>
                </View>
              </CircularProgress>

              {hasExplicitSpfRecommendation && (
                <View style={styles.spfBadge}>
                  <Text variant="body1" style={{ color: colors.onPrimaryContainer, fontWeight: '600' }}>
                    SPF {resolvedSpf}+
                  </Text>
                  <Text variant="caption" style={{ color: colors.onPrimaryContainer, marginTop: spacing.xxs }}>
                    {t('uv.minimumRecommended', 'Minimum recommended')}
                  </Text>
                </View>
              )}
              {displayHourly.length > 1 && (
                <View style={styles.sparklineWrapper}>
                  <UVHourlySparkline data={displayHourly.slice(0, 12)} />
                </View>
              )}
            </View>
          </GlassView>
        ) : (
          <View
            style={[styles.heroCard, styles.heroCardSolid, { backgroundColor: colors.surface }]}
            accessibilityRole="alert"
            accessibilityLabel={`UV Index: ${uvIndex.value}, ${uvLevelLabel}. SPF ${resolvedSpf}+ ${t('uv.protection', 'Protection recommended')}`}
          >
            <View style={styles.heroContent}>
              <Text variant="h2" style={[styles.heroTitle, { color: colors.onSurface }]}> 
                {t('uv.currentIndex', 'Current UV Index')}
              </Text>
              {weatherSnapshot?.location?.city && (
                <Text variant="body2" style={{ color: colors.onSurfaceVariant }}>
                  {t('uv.locationSubtitle', 'Based on conditions in {{city}}', {
                    city: weatherSnapshot.location.city,
                  })}
                </Text>
              )}

              <CircularProgress
                value={uvIndex.value}
                max={11}
                size={240}
                trackWidth={16}
                gradient={['#30D158', '#FFD60A', '#FF9F0A', '#FF453A', '#BF5AF2']}
              >
                <View style={styles.uvProgressCenter}>
                  <Text variant="h1" style={{ color: colors.onSurface, fontSize: 76, fontWeight: '200' }}>
                    {uvIndex.value}
                  </Text>
                  <Text variant="h3" style={{ color: colors.primary, marginTop: spacing.xs, fontWeight: '600' }}>
                    {uvLevelLabel}
                  </Text>
                  <Text variant="body2" style={{ color: colors.onSurfaceVariant, marginTop: spacing.sm }}>
                    {t('uv.protection', 'Protection recommended')}
                  </Text>
                </View>
              </CircularProgress>

              {hasExplicitSpfRecommendation && (
                <View style={styles.spfBadge}>
                  <Text variant="body1" style={{ color: colors.onPrimaryContainer, fontWeight: '600' }}>
                    SPF {resolvedSpf}+
                  </Text>
                  <Text variant="caption" style={{ color: colors.onPrimaryContainer, marginTop: spacing.xxs }}>
                    {t('uv.minimumRecommended', 'Minimum recommended')}
                  </Text>
                </View>
              )}
              {displayHourly.length > 1 && (
                <View style={styles.sparklineWrapper}>
                  <UVHourlySparkline data={displayHourly.slice(0, 12)} />
                </View>
              )}
            </View>
          </View>
        )}
      </Animated.View>

      {/* Hourly Breakdown */}
      {hourlyPreview.length > 0 && (
        <Animated.View
          style={{
            opacity: hourlyAnim.opacity,
            transform: [{ translateY: hourlyAnim.translateY }],
          }}
        >
          {canUseGlass ? (
            <GlassView
              style={styles.glassSection}
              glassEffectStyle="regular"
              tintColor={colors.surfaceTint}
              accessibilityLabel={t('uv.hourlyForecast', 'Hourly UV forecast')}
            >
              <View style={styles.sectionContent}>
                <Text variant="h3" style={[styles.infoTitle, { color: colors.onSurface }]}>
                  {t('uv.hourlyForecast', 'Hourly UV forecast')}
                </Text>
                <UVHourlyChart data={hourlyPreview} locale={preferences.locale} />
                <View style={styles.hourlyList}>
                  {hourlyPreview.map((point, index) => (
                    <View
                      key={point.timestamp}
                      style={[
                        styles.hourRow,
                        index === hourlyPreview.length - 1
                          ? styles.hourRowLast
                          : { borderBottomColor: colors.outlineVariant },
                      ]}
                      accessibilityRole="text"
                      accessibilityLabel={`${formatHour(point.timestamp)}: UV ${Math.round(point.value)} ${getUVLevelLabel(point.level, preferences.locale)}`}>
                      <Text variant="body2" style={{ color: colors.onSurface }}>
                        {formatHour(point.timestamp)}
                      </Text>
                      <Text variant="body2" style={{ color: colors.primary }}>
                        {Math.round(point.value)}
                      </Text>
                      <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
                        {getUVLevelLabel(point.level, preferences.locale)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </GlassView>
          ) : (
            <View style={[styles.solidSection, { backgroundColor: colors.surface }]}>
              <Text variant="h3" style={[styles.infoTitle, { color: colors.onSurface }]}>
                {t('uv.hourlyForecast', 'Hourly UV forecast')}
              </Text>
              <UVHourlyChart data={hourlyPreview} locale={preferences.locale} />
              <View style={styles.hourlyList}>
                {hourlyPreview.map((point, index) => (
                  <View
                    key={point.timestamp}
                    style={[
                      styles.hourRow,
                      index === hourlyPreview.length - 1
                        ? styles.hourRowLast
                        : { borderBottomColor: colors.outlineVariant },
                    ]}
                    accessibilityRole="text"
                    accessibilityLabel={`${formatHour(point.timestamp)}: UV ${Math.round(point.value)} ${getUVLevelLabel(point.level, preferences.locale)}`}>
                    <Text variant="body2" style={{ color: colors.onSurface }}>
                      {formatHour(point.timestamp)}
                    </Text>
                    <Text variant="body2" style={{ color: colors.primary }}>
                      {Math.round(point.value)}
                    </Text>
                    <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
                      {getUVLevelLabel(point.level, preferences.locale)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Animated.View>
      )}
      
      {/* Skin Type Selector with Glass */}
      <Animated.View
        style={{
          opacity: skinCardAnim.opacity,
          transform: [{ translateY: skinCardAnim.translateY }],
        }}
      >
        {canUseGlass ? (
          <GlassView
            style={styles.glassSection}
            glassEffectStyle="regular"
            tintColor={colors.surfaceTint}
            accessibilityLabel={t('uv.skinTypePrompt', 'Select your skin type for personalized recommendations')}
            accessibilityHint={t('uv.skinTypeAccessibilityHint', 'Double tap to change your skin type selection')}
          >
            <View style={styles.sectionContent}>
              <Text variant="body2" style={[styles.sectionNote, { color: colors.onSurfaceVariant }]}>
                {t('uv.skinTypePrompt')}
              </Text>
              <SkinTypeSelector
                value={skinType}
                onChange={(type) => {
                  triggerHaptic('light');
                  updatePreference('skinType', type);
                }}
                locale={preferences.locale}
              />
            </View>
          </GlassView>
        ) : (
          <View
            style={[styles.solidSection, { backgroundColor: colors.surface }]}
            accessibilityRole="button"
            accessibilityLabel={t('uv.skinTypePrompt', 'Select your skin type for personalized recommendations')}
          >
            <Text variant="body2" style={[styles.sectionNote, { color: colors.onSurfaceVariant }]}>
              {t('uv.skinTypePrompt')}
            </Text>
            <SkinTypeSelector
              value={skinType}
              onChange={(type) => {
                triggerHaptic('light');
                updatePreference('skinType', type);
              }}
              locale={preferences.locale}
            />
          </View>
        )}
      </Animated.View>
      
      {/* AI-Powered SPF Recommendations */}
      {recommendations.length > 0 && (
        <Animated.View
          style={{
            opacity: recommendationsAnim.opacity,
            transform: [{ translateY: recommendationsAnim.translateY }],
          }}
        >
          {canUseGlass ? (
            <GlassView
              style={styles.glassSection}
              glassEffectStyle="regular"
              tintColor={colors.surfaceTint}
              accessibilityLabel={`SPF ${resolvedSpf} recommended. ${recommendations.length} safety recommendations`}
            >
              <View style={styles.sectionContent}>
                <UVRecommendations
                  recommendations={recommendations}
                  spfRecommendation={spfRecommendation}
                />
              </View>
            </GlassView>
          ) : (
            <View
              style={[styles.solidSection, { backgroundColor: colors.surface }]}
              accessibilityLabel={`SPF ${resolvedSpf} recommended. ${recommendations.length} safety recommendations`}
            >
              <UVRecommendations
                recommendations={recommendations}
                spfRecommendation={spfRecommendation}
              />
            </View>
      )}
    </Animated.View>
  )}

      {hasDaylightData && (
        <Animated.View
          style={{
            opacity: daylightAnim.opacity,
            transform: [{ translateY: daylightAnim.translateY }],
          }}
        >
          <DaylightSection
            sunrise={sunrise}
            sunset={sunset}
            solarNoon={solarNoon}
            daylightDurationMinutes={daylightDurationMinutes}
            peakUV={peakUVValue}
            currentTime={new Date()}
          />
        </Animated.View>
      )}

      {/* Educational UV Information */}
      {canUseGlass ? (
        <GlassView 
          style={styles.glassSection}
          glassEffectStyle="regular"
          tintColor={colors.surfaceTint}
          accessibilityLabel={t('uv.aboutTitle', 'About UV Index')}
        >
          <View style={styles.sectionContent}>
            <Text variant="h3" style={[styles.infoTitle, { color: colors.onSurface }]}>
              {t('uv.aboutTitle')}
            </Text>
            <Text variant="body2" style={{ color: colors.onSurfaceVariant }}>
              {t('uv.aboutDescription')}
            </Text>
          </View>
        </GlassView>
      ) : (
        <View 
          style={[styles.solidSection, { backgroundColor: colors.surface }]}
          accessibilityLabel={t('uv.aboutTitle', 'About UV Index')}
        >
          <Text variant="h3" style={[styles.infoTitle, { color: colors.onSurface }]}>
            {t('uv.aboutTitle')}
          </Text>
          <Text variant="body2" style={{ color: colors.onSurfaceVariant }}>
            {t('uv.aboutDescription')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  // Hero UV card with prominent glass effect
  heroCard: {
    borderRadius: borderRadius['2xl'],
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  heroCardSolid: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  heroContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  uvProgressCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spfBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  sparklineWrapper: {
    width: '100%',
    marginTop: spacing.md,
  },
  // Glass sections (iOS 26+)
  glassSection: {
    borderRadius: borderRadius.xl,
    marginVertical: spacing.xs,
    overflow: 'hidden',
  },
  sectionContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  // Solid sections (Android, iOS < 26, accessibility)
  solidSection: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginVertical: spacing.xs,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionNote: {
    textAlign: 'center',
  },
  infoTitle: {
    marginBottom: spacing.sm,
  },
  hourlyList: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hourRowLast: {
    borderBottomWidth: 0,
  },
  locationTitle: {
    textAlign: 'center',
  },
  locationMessage: {
    textAlign: 'center',
  },
});
