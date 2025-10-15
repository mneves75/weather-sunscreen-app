/**
 * UV Hourly Chart (Detail Screen)
 * Displays a 24-hour UV projection with axis labels and accessible summaries.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme';
import { UVHourlyPoint } from '@/src/types';

interface UVHourlyChartProps {
  data: UVHourlyPoint[];
  locale?: string;
}

const VERTICAL_TICKS = [0, 3, 6, 9, 11];

export function UVHourlyChart({ data, locale = 'en' }: UVHourlyChartProps) {
  const colors = useColors();

  const { areaPath, linePath, ticks, maxValue, accessibleSummary } = useMemo(() => {
    if (!data.length) {
      return {
        areaPath: '',
        linePath: '',
        ticks: [] as Array<{ hour: string; x: number }>,
        maxValue: 1,
        accessibleSummary: 'UV data unavailable',
      };
    }

    const trimmed = data.slice(0, 24);
    const highest = trimmed.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), trimmed[0]);
    const cappedMax = Math.max(...trimmed.map(point => point.value), 1);
    const horizontalStep = trimmed.length > 1 ? 1 / (trimmed.length - 1) : 0;

    let line = '';
    let area = '';

    trimmed.forEach((point, index) => {
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

      if (index === trimmed.length - 1) {
        area += `L ${x.toFixed(6)} 1 Z`;
      }
    });

    const labelFormatter = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      hour12: true,
    });

    const tickCount = Math.min(6, trimmed.length);
    const tickEvery = Math.max(1, Math.floor(trimmed.length / tickCount));
    const xTicks = trimmed.map((point, index) => {
      if (index % tickEvery !== 0 && index !== trimmed.length - 1) {
        return null;
      }
      const x = index * horizontalStep;
      const hour = labelFormatter.format(new Date(point.timestamp));
      return { hour, x };
    }).filter(Boolean) as Array<{ hour: string; x: number }>;

    const accessibleSummary = `Peak UV ${Math.round(highest.value)} at ${labelFormatter.format(new Date(highest.timestamp))}.`;

    return {
      areaPath: area.trim(),
      linePath: line.trim(),
      ticks: xTicks,
      maxValue: cappedMax,
      accessibleSummary,
    };
  }, [data, locale]);

  if (!data.length) {
    return (
      <View style={styles.placeholder} accessibilityRole="text" accessibilityLabel="UV data unavailable">
        <Text variant="body2" style={{ color: colors.onSurfaceVariant }}>
          UV data unavailable
        </Text>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      accessibilityRole="summary"
      accessibilityLabel={accessibleSummary}
    >
      <View style={styles.yAxisLabels}>
        {VERTICAL_TICKS.map(value => (
          <Text key={value} variant="caption" style={[styles.axisLabel, { color: colors.onSurfaceVariant }]}>
            {value}
          </Text>
        ))}
      </View>
      <Svg style={styles.chart} viewBox="0 0 1 1" preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient id="uvDetailGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={0.05} />
          </SvgLinearGradient>
        </Defs>

        <Rect x="0" y="0" width="1" height="1" fill={colors.surfaceVariant} opacity={0.1} />

        {VERTICAL_TICKS.map(value => (
          <Path
            key={`grid-${value}`}
            d={`M 0 ${1 - value / Math.max(maxValue, 1)} L 1 ${1 - value / Math.max(maxValue, 1)}`}
            stroke={colors.outlineVariant}
            strokeWidth={0.001}
            strokeDasharray="0.01"
          />
        ))}

        {areaPath.length > 0 && (
          <Path d={areaPath} fill="url(#uvDetailGradient)" vectorEffect="non-scaling-stroke" />
        )}
        {linePath.length > 0 && (
          <Path
            d={linePath}
            fill="transparent"
            stroke={colors.primary}
            strokeWidth={0.008}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {ticks.map(tick => (
          <SvgText
            key={tick.hour}
            x={tick.x}
            y={0.98}
            fill={colors.onSurfaceVariant}
            fontSize={0.04}
            textAnchor="middle"
          >
            {tick.hour.replace(':00', '')}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    paddingBottom: 12,
  },
  chart: {
    flex: 1,
    height: 240,
  },
  yAxisLabels: {
    justifyContent: 'space-between',
    marginRight: 8,
    paddingVertical: 4,
  },
  axisLabel: {
    fontVariant: ['tabular-nums'],
  },
  placeholder: {
    padding: 16,
    borderRadius: 16,
  },
});
