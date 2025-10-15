/**
 * Daylight arc visualization using react-native-svg.
 * Displays sunrise/sunset arc with animated fill and solar noon summary.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleProp, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Stop, Circle } from 'react-native-svg';
import { Text } from '@/src/components/ui';
import { Icon } from '@/src/components/ui/Icon';
import { tokens } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme';
import {
  calculateUVLevel,
  formatDaylightTime,
  formatTimeShort,
  getCurrentDaylightProgress,
  getUVBarColor,
  getUVLevelLabel,
  UV_GRADIENT,
} from '@/src/utils';
import { useTranslation } from 'react-i18next';

interface DaylightArcProps {
  sunrise: string;
  sunset: string;
  solarNoon: string;
  daylightDurationMinutes: number;
  peakUV?: number;
  currentTime?: string | Date;
  style?: StyleProp<ViewStyle>;
}

const { spacing, borderRadius } = tokens;
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const DaylightArc: React.FC<DaylightArcProps> = ({
  sunrise,
  sunset,
  solarNoon,
  daylightDurationMinutes,
  peakUV,
  currentTime,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();

  const [reduceMotion, setReduceMotion] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription?.remove();
  }, []);

  const progress = useMemo(
    () => getCurrentDaylightProgress(sunrise, sunset, currentTime ?? new Date()),
    [sunrise, sunset, currentTime]
  );

  useEffect(() => {
    if (reduceMotion) {
      animatedValue.stopAnimation();
      animatedValue.setValue(progress);
      setDisplayProgress(progress);
      return;
    }

    const id = animatedValue.addListener(({ value }) => setDisplayProgress(value));
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(id);
    };
  }, [progress, reduceMotion, animatedValue]);

  // Responsive sizing: Calculate arc size based on screen width with constraints
  // - Subtract padding (16px * 2 = 32px horizontal padding from parent container)
  // - Clamp between 240px (small phones) and 320px (tablets/large phones)
  // This ensures optimal legibility across iPhone SE to iPad Pro
  const size = useMemo(() => {
    const availableWidth = windowWidth - (spacing.md * 2); // Account for container padding
    return Math.max(240, Math.min(320, availableWidth));
  }, [windowWidth]);

  const strokeWidth = 14;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  const sunrisePoint = polarToCartesian(center, center, radius, Math.PI);
  const sunsetPoint = polarToCartesian(center, center, radius, 0);
  const sunPoint = polarToCartesian(center, center, radius, Math.PI - (Math.PI * displayProgress));

  const baselinePath = useMemo(
    () => describeArc(center, center, radius, Math.PI, 0),
    [center, radius]
  );

  const activePath = useMemo(
    () => (displayProgress > 0 ? describeArc(center, center, radius, Math.PI, Math.PI - (Math.PI * displayProgress)) : ''),
    [center, radius, displayProgress]
  );

  const solarNoonFormatted = formatTimeShort(solarNoon || sunrise);
  const sunriseFormatted = formatTimeShort(sunrise);
  const sunsetFormatted = formatTimeShort(sunset);
  const daylightFormatted = formatDaylightTime(daylightDurationMinutes);

  const hasPeakUV = typeof peakUV === 'number' && !Number.isNaN(peakUV);
  const peakUVValue = hasPeakUV ? peakUV! : 0;
  const peakUVLevel = calculateUVLevel(peakUVValue);
  const peakUVLabel = getUVLevelLabel(peakUVLevel, i18n.language);
  const peakUVColor = getUVBarColor(peakUVValue);
  const peakUVDisplayColor = hasPeakUV ? (isDark ? peakUVColor.dark : peakUVColor.light) : colors.onSurface;

  const accessibilityLabel = t('daylight.accessibilityArc', {
    hours: Math.floor(daylightDurationMinutes / 60),
    minutes: daylightDurationMinutes % 60,
  });

  return (
    <View style={[styles.wrapper, style]} accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <View style={styles.arcContainer}>
        <Svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
          <Defs>
            {/* Design system UV gradient (moderate→high range for typical daylight UV) */}
            {/* UV_GRADIENT[1] = #FFD60A (moderate), UV_GRADIENT[2] = #FF9F0A (high) */}
            <SvgLinearGradient id="daylightGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={UV_GRADIENT[1]} />
              <Stop offset="100%" stopColor={UV_GRADIENT[2]} />
            </SvgLinearGradient>
          </Defs>
          <Path
            d={baselinePath}
            stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          {activePath !== '' && (
            <AnimatedPath
              d={activePath}
              stroke="url(#daylightGradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          )}
          <Circle cx={sunrisePoint.x} cy={sunrisePoint.y} r={4} fill={colors.primary} />
          <Circle cx={sunsetPoint.x} cy={sunsetPoint.y} r={4} fill={colors.primary} />
          {displayProgress > 0 && (
            <Circle
              cx={sunPoint.x}
              cy={sunPoint.y}
              r={8}
              fill={peakUVDisplayColor}
              stroke={colors.background}
              strokeWidth={2}
            />
          )}
        </Svg>

        <View style={styles.centerContent} pointerEvents="none">
          <Text variant="caption" style={[styles.centerLabel, { color: colors.onSurfaceVariant }]}>
            {t('daylight.solarNoon', 'Solar noon')}
          </Text>
          <Text variant="h3" style={[styles.centerValue, { color: colors.onSurface }]}>
            {solarNoonFormatted || '—'}
          </Text>
          <Text variant="caption" style={[styles.centerLabel, { color: colors.onSurfaceVariant }]}>
            {t('daylight.peakUV', 'Peak UV')}
          </Text>
          <Text variant="body1" style={[styles.centerValue, { color: peakUVDisplayColor }]}>
            {hasPeakUV ? `${peakUVValue} • ${peakUVLabel}` : '—'}
          </Text>
          <Text variant="caption" style={[styles.centerLabel, { color: colors.onSurfaceVariant }]}>
            {t('daylight.duration', 'Daylight')}
          </Text>
          <Text variant="body2" style={[styles.centerValue, { color: colors.onSurface }]}>
            {daylightFormatted}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.footerItem}>
          <Icon name="sun" size={20} color={colors.secondary} />
          <View style={styles.footerText}>
            <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
              {t('daylight.sunrise', 'Sunrise')}
            </Text>
            <Text variant="body2" style={{ color: colors.onSurface }}>
              {sunriseFormatted || '—'}
            </Text>
          </View>
        </View>

        <View style={styles.footerItem}>
          <Icon name="moon" size={20} color={colors.tertiary} />
          <View style={styles.footerText}>
            <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
              {t('daylight.sunset', 'Sunset')}
            </Text>
            <Text variant="body2" style={{ color: colors.onSurface }}>
              {sunsetFormatted || '—'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInRadians: number) {
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians)),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const angleDiff = Math.abs(endAngle - startAngle);
  const largeArcFlag = angleDiff >= Math.PI ? 1 : 0;
  const sweepFlag = 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  arcContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'visible',
  },
  centerContent: {
    position: 'absolute',
    top: spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.xs,
  },
  centerLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  centerValue: {
    fontWeight: '600',
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    gap: spacing.xxs,
  },
});
