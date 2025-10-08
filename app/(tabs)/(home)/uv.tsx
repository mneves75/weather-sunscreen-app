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

import { CircularProgress, Container, ErrorView, LoadingSpinner, Text } from '@/src/components/ui';
import { SkinTypeSelector, UVRecommendations } from '@/src/components/weather';
import { useSettings } from '@/src/context/SettingsContext';
import { useUVIndex } from '@/src/hooks';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useColors, useGlassAvailability } from '@/src/theme';
import { tokens } from '@/src/theme/tokens';
import { createSlideUpComponent } from '@/src/theme/animations';
import { GlassView } from 'expo-glass-effect';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Animated, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

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
  } = useUVIndex();

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
  const recommendationsAnim = createSlideUpComponent(50, 150);

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
  }, [recommendations, reduceMotion]);
  
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
          message={t('errors.uvData')}
          onRetry={refresh}
        />
      </Container>
    );
  }

  if (!uvIndex) {
    return (
      <Container style={styles.centerContainer}>
        <ErrorView
          message={t('errors.uvData')}
          onRetry={refresh}
        />
      </Container>
    );
  }
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
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
            glassEffectStyle="prominent"
            tintColor={colors.surfaceTint}
            accessibilityRole="alert"
            accessibilityLabel={`UV Index: ${uvIndex.value}, ${uvLevelLabel}. ${t('uv.protection', 'Protection recommended')}`}
          >
            <View style={styles.heroContent}>
              <Text variant="h2" style={[styles.heroTitle, { color: colors.onSurface }]}>
                {t('uv.currentIndex', 'Current UV Index')}
              </Text>

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

              {spfRecommendation && (
                <View style={styles.spfBadge}>
                  <Text variant="body1" style={{ color: colors.onPrimaryContainer, fontWeight: '600' }}>
                    SPF {spfRecommendation.minimumSpf}+
                  </Text>
                  <Text variant="caption" style={{ color: colors.onPrimaryContainer, marginTop: spacing.xxs }}>
                    {t('uv.minimumRecommended', 'Minimum recommended')}
                  </Text>
                </View>
              )}
            </View>
          </GlassView>
        ) : (
          <View
            style={[styles.heroCard, styles.heroCardSolid, { backgroundColor: colors.surface }]}
            accessibilityRole="alert"
            accessibilityLabel={`UV Index: ${uvIndex.value}, ${uvLevelLabel}. ${t('uv.protection', 'Protection recommended')}`}
          >
            <View style={styles.heroContent}>
              <Text variant="h2" style={[styles.heroTitle, { color: colors.onSurface }]}>
                {t('uv.currentIndex', 'Current UV Index')}
              </Text>

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

              {spfRecommendation && (
                <View style={styles.spfBadge}>
                  <Text variant="body1" style={{ color: colors.onPrimaryContainer, fontWeight: '600' }}>
                    SPF {spfRecommendation.minimumSpf}+
                  </Text>
                  <Text variant="caption" style={{ color: colors.onPrimaryContainer, marginTop: spacing.xxs }}>
                    {t('uv.minimumRecommended', 'Minimum recommended')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </Animated.View>
      
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
              accessibilityLabel={`SPF ${spfRecommendation?.minimumSpf} recommended. ${recommendations.length} safety recommendations`}
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
              accessibilityLabel={`SPF ${spfRecommendation?.minimumSpf} recommended. ${recommendations.length} safety recommendations`}
            >
              <UVRecommendations
                recommendations={recommendations}
                spfRecommendation={spfRecommendation}
              />
            </View>
          )}
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
  },
  // Hero UV card with prominent glass effect
  heroCard: {
    borderRadius: borderRadius.xxl,
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
});
