/**
 * UV recommendations list component
 */

import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import { UVRecommendation } from '@/src/types';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface UVRecommendationsProps {
  recommendations: UVRecommendation[];
  spfRecommendation?: number | null;
}

export const UVRecommendations = React.memo<UVRecommendationsProps>(({ 
  recommendations,
  spfRecommendation,
}) => {
  const colors = useColors();
  const { t } = useTranslation();
  
  const getIconForType = (type: UVRecommendation['type']): string => {
    switch (type) {
      case 'spf':
        return '🧴';
      case 'shade':
        return '🌳';
      case 'clothing':
        return '👕';
      case 'sunglasses':
        return '🕶️';
      case 'timing':
        return '⏰';
    }
  };
  
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.primary;
      case 'low':
        return colors.tertiary;
      default:
        return colors.onSurface;
    }
  };
  
  return (
    <View 
      style={[styles.container, { backgroundColor: colors.surface }]}
      accessibilityRole="list"
    >
      <Text variant="h3" style={[styles.title, { color: colors.onSurface }]}>
        {t('uv.recommendations')}
      </Text>

      {spfRecommendation && (
        <View style={[styles.spfBanner, { backgroundColor: colors.primaryContainer }]}>
          <Text style={styles.spfEmoji}>🧴</Text>
          <Text variant="h3" style={{ color: colors.onPrimaryContainer }}>
            {t('uv.spfBanner', { value: spfRecommendation })}
          </Text>
        </View>
      )}
      
      <View style={styles.list}>
        {recommendations.map((rec, index) => (
          <View
            key={`${rec.type}-${index}`}
            style={[
              styles.recommendationItem,
              { borderBottomColor: colors.outlineVariant },
              index === recommendations.length - 1 && styles.lastItem,
            ]}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{getIconForType(rec.type)}</Text>
            </View>
            
            <View style={styles.textContainer}>
              <Text variant="body1" style={{ color: colors.onSurface }}>
                {rec.message}
              </Text>
            </View>
            
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: getPriorityColor(rec.priority) },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
});

UVRecommendations.displayName = 'UVRecommendations';

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
  title: {
    marginBottom: 16,
  },
  spfBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  spfEmoji: {
    fontSize: 32,
  },
  list: {
    gap: 0,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
