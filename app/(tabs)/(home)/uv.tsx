/**
 * UV Index Screen
 * UV index monitoring with SPF recommendations
 * 
 * Modernized with:
 * - Hero glass UV indicator (large visual prominence)
 * - Interactive glass skin selector card
 * - AI-powered SPF recommendations with glass panels
 * - Educational info section with glass effect
 * - Platform-adaptive Material fallbacks
 */

import { Container, ErrorView, LoadingSpinner, Text } from '@/src/components/ui';
import { SkinTypeSelector, UVIndicator, UVRecommendations } from '@/src/components/weather';
import { useSettings } from '@/src/context/SettingsContext';
import { useUVIndex } from '@/src/hooks';
import { useColors, useGlassAvailability } from '@/src/theme';
import { GlassView } from 'expo-glass-effect';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function UVIndexScreen() {
  const colors = useColors();
  const { canUseGlass } = useGlassAvailability();
  const { preferences, updatePreference } = useSettings();
  const { t } = useTranslation();
  
  const { 
    uvIndex,
    spfRecommendation,
    recommendations,
    isLoading, 
    error, 
    refresh,
    skinType,
  } = useUVIndex();
  
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
      {/* Hero UV Indicator (already has glass internally) */}
      <View 
        accessibilityRole="alert"
        accessibilityLabel={`UV Index: ${uvIndex.value}, ${uvIndex.level}. ${t('uv.protection', 'Protection recommended')}`}
      >
        <UVIndicator
          uvIndex={uvIndex}
          locale={preferences.locale}
          size="large"
        />
      </View>
      
      {/* Skin Type Selector with Glass */}
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
              onChange={(type) => updatePreference('skinType', type)}
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
            onChange={(type) => updatePreference('skinType', type)}
            locale={preferences.locale}
          />
        </View>
      )}
      
      {/* AI-Powered SPF Recommendations */}
      {recommendations.length > 0 && (
        canUseGlass ? (
          <GlassView 
            style={styles.glassSection}
            glassEffectStyle="regular"
            tintColor={colors.surfaceTint}
            accessibilityLabel={`SPF ${spfRecommendation} recommended. ${recommendations.length} safety recommendations`}
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
            accessibilityLabel={`SPF ${spfRecommendation} recommended. ${recommendations.length} safety recommendations`}
          >
            <UVRecommendations
              recommendations={recommendations}
              spfRecommendation={spfRecommendation}
            />
          </View>
        )
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
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  // Glass sections (iOS 26+)
  glassSection: {
    borderRadius: 20,
    marginVertical: 8,
    overflow: 'hidden',
  },
  sectionContent: {
    padding: 20,
    gap: 16,
  },
  // Solid sections (Android, iOS < 26, accessibility)
  solidSection: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    gap: 16,
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
    marginBottom: 12,
  },
});
