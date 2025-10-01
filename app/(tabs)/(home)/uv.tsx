/**
 * UV Index Screen
 * UV index monitoring with SPF recommendations
 */

import { Container, ErrorView, LoadingSpinner, Text } from '@/src/components/ui';
import { SkinTypeSelector, UVIndicator, UVRecommendations } from '@/src/components/weather';
import { useSettings } from '@/src/context/SettingsContext';
import { useUVIndex } from '@/src/hooks';
import { useColors } from '@/src/theme/theme';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function UVIndexScreen() {
  const colors = useColors();
  const { preferences, updatePreference } = useSettings();
  
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
        <LoadingSpinner message={preferences.locale === 'pt-BR' ? 'Carregando...' : 'Loading...'} />
      </Container>
    );
  }
  
  // Show error if data failed to load
  if (error && !uvIndex) {
    return (
      <Container style={styles.centerContainer}>
        <ErrorView
          message={
            preferences.locale === 'pt-BR'
              ? 'Não foi possível carregar o índice UV.'
              : 'Could not load UV index.'
          }
          onRetry={refresh}
        />
      </Container>
    );
  }
  
  if (!uvIndex) {
    return (
      <Container style={styles.centerContainer}>
        <ErrorView
          message={
            preferences.locale === 'pt-BR'
              ? 'Não foi possível carregar o índice UV.'
              : 'Could not load UV index.'
          }
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
      {/* UV Indicator */}
      <UVIndicator
        uvIndex={uvIndex}
        locale={preferences.locale}
        size="large"
      />
      
      {/* Skin Type Selector */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text variant="body2" style={[styles.sectionNote, { color: colors.onSurfaceVariant }]}>
          {preferences.locale === 'pt-BR'
            ? 'Selecione seu tipo de pele para recomendações personalizadas de FPS'
            : 'Select your skin type for personalized SPF recommendations'}
        </Text>
        <SkinTypeSelector
          value={skinType}
          onChange={(type) => updatePreference('skinType', type)}
          locale={preferences.locale}
        />
      </View>
      
      {/* UV Recommendations */}
      {recommendations.length > 0 && (
        <UVRecommendations
          recommendations={recommendations}
          spfRecommendation={spfRecommendation}
        />
      )}
      
      {/* UV Information */}
      <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
        <Text variant="h3" style={[styles.infoTitle, { color: colors.onSurface }]}>
          {preferences.locale === 'pt-BR' ? 'Sobre o Índice UV' : 'About UV Index'}
        </Text>
        <Text variant="body2" style={{ color: colors.onSurfaceVariant }}>
          {preferences.locale === 'pt-BR'
            ? 'O índice UV mede a intensidade da radiação ultravioleta do sol. Valores mais altos indicam maior risco de danos à pele e aos olhos.'
            : 'The UV index measures the strength of ultraviolet radiation from the sun. Higher values indicate greater risk of harm to skin and eyes.'}
        </Text>
      </View>
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
  section: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    gap: 16,
  },
  sectionNote: {
    textAlign: 'center',
  },
  infoSection: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
  infoTitle: {
    marginBottom: 12,
  },
});

