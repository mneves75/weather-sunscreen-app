/**
 * UV Hourly Sparkline
 * Lightweight SVG chart used on the Home screen to summarize upcoming UV levels.
 * Rendered as a smooth area/line graph with adaptive scaling.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';
import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme';
import { UVHourlyPoint } from '@/src/types';
import { getUVLevelColor } from '@/src/utils';

interface UVHourlySparklineProps {
  data: UVHourlyPoint[];
  style?: ViewStyle;
  height?: number;
  label?: string;
}

const CHART_PADDING = 8;

export function UVHourlySparkline({
  data,
  style,
  height = 68,
  label,
}: UVHourlySparklineProps) {
  const colors = useColors();

  const { areaPath, linePath, gradientStops, maxValue } = useMemo(() => {
    if (!data.length) {
      return {
        areaPath: '',
        linePath: '',
        gradientStops: ['#30D158', '#FFD60A'],
        maxValue: 1,
      };
    }

    const cappedMax = Math.max(...data.map(point => point.value), 1);
    const horizontalStep = data.length > 1 ? 1 / (data.length - 1) : 0;

    let line = '';
    let area = '';

    data.forEach((point, index) => {
      const xRatio = index * horizontalStep;
      const yRatio = point.value / cappedMax;
      const x = xRatio;
      const y = 1 - yRatio;

      const command = `${index === 0 ? 'M' : 'L'} ${x.toFixed(6)} ${y.toFixed(6)}`;
      line += `${command} `;

      if (index === 0) {
        area += `M ${x.toFixed(6)} 1 L ${x.toFixed(6)} ${y.toFixed(6)} `;
      } else {
        area += `L ${x.toFixed(6)} ${y.toFixed(6)} `;
      }

      if (index === data.length - 1) {
        area += `L ${x.toFixed(6)} 1 Z`;
      }
    });

    const gradient = [
      getUVLevelColor('low').indicator,
      getUVLevelColor('moderate').indicator,
      getUVLevelColor('high').indicator,
      getUVLevelColor('very-high').indicator,
    ];

    return {
      areaPath: area.trim(),
      linePath: line.trim(),
      gradientStops: gradient,
      maxValue: cappedMax,
    };
  }, [data]);

  if (!data.length) {
    return (
      <View style={[styles.placeholderContainer, style]}
        accessibilityRole="text"
        accessibilityLabel="UV forecast unavailable">
        <Text variant="body2" style={{ color: colors.onSurfaceVariant }}>
          Upcoming UV forecast unavailable
        </Text>
      </View>
    );
  }

  const badgeText = label ?? 'Next Hours';
  const highestHour = data.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), data[0]);
  const peakHour = new Date(highestHour.timestamp).toLocaleTimeString(undefined, {
    hour: 'numeric',
    hour12: true,
  });

  return (
    <View style={[styles.container, style]}
      accessibilityRole="summary"
      accessibilityLabel={`${badgeText}: peak UV ${Math.round(highestHour.value)} around ${peakHour}`}>
      <View style={styles.headerRow}>
        <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
          {badgeText}
        </Text>
        <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
          Max {Math.round(maxValue)} UV
        </Text>
      </View>
      <Svg
        style={{ width: '100%', height }}
        viewBox={`0 0 1 1`}
        preserveAspectRatio="none"
      >
        <Defs>
          <SvgLinearGradient id="uvSparklineGradient" x1="0" y1="0" x2="0" y2="1">
            {gradientStops.map((stop, index) => (
              <Stop
                key={stop}
                offset={`${(index / Math.max(gradientStops.length - 1, 1)) * 100}%`}
                stopColor={stop}
                stopOpacity={index === 0 ? 0.32 : 0.12}
              />
            ))}
          </SvgLinearGradient>
        </Defs>

        {areaPath.length > 0 && (
          <Path
            d={areaPath}
            fill="url(#uvSparklineGradient)"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {linePath.length > 0 && (
          <Path
            d={linePath}
            fill="transparent"
            stroke={colors.primary}
            strokeWidth={CHART_PADDING / 100}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: CHART_PADDING,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  placeholderContainer: {
    padding: CHART_PADDING,
    borderRadius: 12,
  },
});

