import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/theme';
import { UVIndexData } from '../../types/weather';
import { LiquidGlassWrapper } from '../glass/LiquidGlassWrapper';

interface UVIndexCardProps {
  uvData: UVIndexData | undefined;
  style?: ViewStyle;
}

function UVIndexCard({ uvData, style }: UVIndexCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const uvColor = useMemo(() => getUVColor(uvData?.value || 0), [uvData?.value]);
  const uvIntensity = useMemo(() => getUVIntensity(uvData?.value || 0), [uvData?.value]);

  if (!uvData) {
    return (
      <LiquidGlassWrapper variant="regular" style={[styles.container, style]}>
        <View style={styles.content}>
          <Text style={styles.noDataText}>UV data unavailable</Text>
        </View>
      </LiquidGlassWrapper>
    );
  }

  return (
    <LiquidGlassWrapper variant="regular" style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>UV Index</Text>
          <Text style={[styles.levelBadge, { backgroundColor: uvColor + '20', color: uvColor }]}>
            {uvData.level}
          </Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.uvIndexSection}>
            <Text
              style={[styles.uvIndex, { color: uvColor }]}
              accessibilityLabel={`UV Index ${uvData.value}`}
            >
              {uvData.value}
            </Text>
            <Text style={styles.maxUVText}>Max today: {uvData.maxToday}</Text>
            <Text style={styles.peakTimeText}>Peak: {uvData.peakTime}</Text>
          </View>

          <View style={styles.intensityBar}>
            <View
              style={[
                styles.intensityIndicator,
                { width: `${uvIntensity}%`, backgroundColor: uvColor },
              ]}
            />
          </View>
        </View>

        <View style={styles.recommendation}>
          <Text style={styles.recommendationTitle}>
            Recommended SPF: {uvData.sunscreenRecommendation.spf}+
          </Text>
          <Text style={styles.recommendationText}>
            Reapply {uvData.sunscreenRecommendation.applicationFrequency}
          </Text>
          {uvData.sunscreenRecommendation.additionalTips.length > 0 && (
            <Text style={styles.tipsText}>{uvData.sunscreenRecommendation.additionalTips[0]}</Text>
          )}
        </View>
      </View>
    </LiquidGlassWrapper>
  );
}

function getUVColor(uvIndex: number): string {
  if (uvIndex <= 2) return '#22c55e'; // Green - Low
  if (uvIndex <= 5) return '#eab308'; // Yellow - Moderate
  if (uvIndex <= 7) return '#f97316'; // Orange - High
  if (uvIndex <= 10) return '#ef4444'; // Red - Very High
  return '#8b5cf6'; // Purple - Extreme
}

function getUVIntensity(uvIndex: number): number {
  // Convert UV index to percentage (max reasonable UV is about 15)
  return Math.min((uvIndex / 15) * 100, 100);
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      borderRadius: 16,
    },
    content: {
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
    },
    levelBadge: {
      fontSize: 12,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      overflow: 'hidden',
    },
    mainContent: {
      marginBottom: 16,
    },
    uvIndexSection: {
      alignItems: 'center',
      marginBottom: 12,
    },
    uvIndex: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 42,
    },
    maxUVText: {
      fontSize: 14,
      color: colors.secondary,
      marginTop: 4,
    },
    peakTimeText: {
      fontSize: 12,
      color: colors.secondary,
      marginTop: 2,
    },
    intensityBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    intensityIndicator: {
      height: '100%',
      borderRadius: 3,
    },
    recommendation: {
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    recommendationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 4,
    },
    recommendationText: {
      fontSize: 14,
      color: colors.secondary,
      marginBottom: 4,
    },
    tipsText: {
      fontSize: 12,
      color: colors.secondary,
      fontStyle: 'italic',
    },
    noDataText: {
      fontSize: 16,
      color: colors.secondary,
      textAlign: 'center',
      paddingVertical: 40,
    },
  });

export { UVIndexCard };
export default memo(UVIndexCard);
