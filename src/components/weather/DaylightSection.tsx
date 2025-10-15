/**
 * Daylight section wrapper that applies Liquid Glass and renders DaylightArc.
 */

import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from '@/src/components/ui';
import { Icon } from '@/src/components/ui/Icon';
import { GlassView } from '@/src/components/glass';
import { useColors, useGlassAvailability } from '@/src/theme';
import { tokens } from '@/src/theme/tokens';
import { DaylightArc } from './DaylightArc';
import { useTranslation } from 'react-i18next';

interface DaylightSectionProps {
  sunrise: string;
  sunset: string;
  solarNoon: string;
  daylightDurationMinutes: number;
  peakUV?: number;
  currentTime?: string | Date;
  style?: StyleProp<ViewStyle>;
}

const { spacing, borderRadius } = tokens;

export const DaylightSection: React.FC<DaylightSectionProps> = ({
  sunrise,
  sunset,
  solarNoon,
  daylightDurationMinutes,
  peakUV,
  currentTime,
  style,
}) => {
  const colors = useColors();
  const { canUseGlass } = useGlassAvailability();
  const { t } = useTranslation();

  const sectionLabel = t('daylight.title', 'Daylight');
  const accessibilityLabel = t('daylight.accessibilityArc', {
    hours: Math.floor(daylightDurationMinutes / 60),
    minutes: daylightDurationMinutes % 60,
  });

  const content = (
    <View style={[styles.content, { backgroundColor: canUseGlass ? 'transparent' : colors.surface }]}>
      <View style={styles.header}>
        <Icon name="sun" size={24} color={colors.secondary} />
        <Text variant="h3" style={{ color: colors.onSurface }}>
          {sectionLabel}
        </Text>
      </View>

      <DaylightArc
        sunrise={sunrise}
        sunset={sunset}
        solarNoon={solarNoon}
        daylightDurationMinutes={daylightDurationMinutes}
        peakUV={peakUV}
        currentTime={currentTime}
      />
    </View>
  );

  if (canUseGlass) {
    return (
      <GlassView
        style={[styles.glassWrapper, style]}
        glassEffectStyle="regular"
        tintColor={colors.surfaceTint}
        accessibilityRole="summary"
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        styles.solidWrapper,
        { backgroundColor: colors.surface, shadowColor: '#000' },
        style,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  glassWrapper: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  solidWrapper: {
    borderRadius: borderRadius.xl,
    marginVertical: spacing.xs,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
