/**
 * UV Index indicator component with visual representation
 */

import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import { UVIndex } from '@/src/types';
import { formatUVIndex, getUVLevelColor, getUVLevelLabel } from '@/src/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

interface UVIndicatorProps {
  uvIndex: UVIndex;
  locale?: string;
  size?: 'small' | 'large';
}

export const UVIndicator = React.memo<UVIndicatorProps>(({ 
  uvIndex, 
  locale = 'en',
  size = 'large',
}) => {
  const colors = useColors();
  const { t } = useTranslation();
  const uvColor = getUVLevelColor(uvIndex.level);
  const uvLabel = getUVLevelLabel(uvIndex.level, locale);
  
  const isSmall = size === 'small';
  
  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: colors.surface },
        isSmall && styles.containerSmall,
      ]}
      accessibilityRole="text"
      accessibilityLabel={t('accessibility.uvIndicator.summary', {
        defaultValue: 'UV Index {{value}}, Level {{label}}',
        value: formatUVIndex(uvIndex.value),
        label: uvLabel,
      })}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text 
            variant={isSmall ? "body2" : "body1"} 
            style={{ color: colors.onSurfaceVariant }}
          >
            {t('uv.title')}
          </Text>
        </View>
        
        <View style={[styles.indicatorContainer, isSmall && styles.indicatorContainerSmall]}>
          <View
            style={[
              styles.indicator,
              { backgroundColor: uvColor.indicator },
              isSmall && styles.indicatorSmall,
            ]}
          >
            <Text 
              style={[
                styles.value, 
                { color: '#FFFFFF' },
                isSmall && styles.valueSmall,
              ]}
            >
              {formatUVIndex(uvIndex.value)}
            </Text>
          </View>
          
          <View style={styles.labelContainer}>
            <Text 
              variant={isSmall ? "body2" : "h3"}
              style={{ color: uvColor.indicator }}
            >
              {uvLabel}
            </Text>
            
            {uvIndex.peakTime && !isSmall && (
              <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
                {t('uv.peakLabel', { defaultValue: 'Peak: {{time}}', time: uvIndex.peakTime })}
              </Text>
            )}
          </View>
        </View>
        
        {/* UV Level Bar */}
        {!isSmall && (
          <View style={styles.levelBar}>
            <View style={[styles.levelSegment, { backgroundColor: '#4CAF50' }]} />
            <View style={[styles.levelSegment, { backgroundColor: '#FFC107' }]} />
            <View style={[styles.levelSegment, { backgroundColor: '#FF9800' }]} />
            <View style={[styles.levelSegment, { backgroundColor: '#F44336' }]} />
            <View style={[styles.levelSegment, { backgroundColor: '#9C27B0' }]} />
            
            <View 
              style={[
                styles.levelIndicator,
                {
                  left: `${(uvIndex.value / 11) * 100}%`,
                  backgroundColor: uvColor.indicator,
                },
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );
});

UVIndicator.displayName = 'UVIndicator';

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
  containerSmall: {
    padding: 12,
    marginVertical: 4,
  },
  content: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  indicatorContainerSmall: {
    gap: 12,
  },
  indicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  value: {
    fontSize: 32,
    fontWeight: '600',
  },
  valueSmall: {
    fontSize: 20,
  },
  labelContainer: {
    flex: 1,
    gap: 4,
  },
  levelBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  levelSegment: {
    flex: 1,
  },
  levelIndicator: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginLeft: -8,
  },
});
