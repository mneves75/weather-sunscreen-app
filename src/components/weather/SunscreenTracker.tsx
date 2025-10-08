/**
 * Sunscreen Tracker Component
 * Displays sunscreen application status and reapplication timer
 * Allows user to track when they applied sunscreen and get alerts
 */

import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSunscreen } from '../../context/SunscreenContext';
import { useColors, useThemeTokens } from '../../theme/theme';
import { GlassCard } from '../glass/GlassCard';
import { logger } from '../../services/LoggerService';

export const SunscreenTracker: React.FC = () => {
  const { t } = useTranslation();
  const colors = useColors();
  const { typography, borderRadius, spacing } = useThemeTokens();
  const {
    currentApplication,
    alertActive,
    isSwimming,
    applySunscreen,
    clearApplication,
    toggleSwimmingMode,
    timeRemaining,
    timeRemainingFormatted,
    isLoading,
  } = useSunscreen();

  const [isApplying, setIsApplying] = useState(false);

  // Create styles with theme tokens
  const styles = useMemo(() => createStyles(typography, borderRadius, spacing), [typography, borderRadius, spacing]);

  const handleApply = async () => {
    try {
      setIsApplying(true);
      await applySunscreen(isSwimming);
    } catch (error) {
      logger.error('Failed to apply sunscreen', error as Error, 'SUNSCREEN');
    } finally{
      setIsApplying(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearApplication();
    } catch (error) {
      logger.error('Failed to clear application', error as Error, 'SUNSCREEN');
    }
  };

  if (isLoading) {
    return (
      <GlassCard style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary} />
      </GlassCard>
    );
  }

  // No active application
  if (!currentApplication) {
    return (
      <GlassCard style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="sunny" size={24} color={colors.onSurface} />
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {t('sunscreen.title')}
          </Text>
        </View>

        <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
          {t('sunscreen.description')}
        </Text>

        {/* Swimming mode toggle */}
        <Pressable
          style={styles.toggleContainer}
          onPress={toggleSwimmingMode}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isSwimming }}
          accessibilityLabel={t('sunscreen.swimmingMode')}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: isSwimming
                  ? colors.primary
                  : 'transparent',
                borderColor: colors.primary,
              },
            ]}
          >
            {isSwimming && (
              <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
            )}
          </View>
          <Text style={[styles.toggleLabel, { color: colors.onSurface }]}>
            {t('sunscreen.swimmingMode')}
          </Text>
        </Pressable>

        {/* Apply button */}
        <Pressable
          style={[
            styles.button,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={handleApply}
          disabled={isApplying}
          accessibilityRole="button"
          accessibilityLabel={t('sunscreen.apply')}
        >
          {isApplying ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={20} color={colors.onPrimary} />
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                {t('sunscreen.apply')}
              </Text>
            </>
          )}
        </Pressable>
      </GlassCard>
    );
  }

  // Active application
  const isExpired = timeRemaining === 0 || alertActive;
  const appliedDate = new Date(currentApplication.appliedAt);
  const appliedTime = appliedDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name={isExpired ? 'alert-circle' : 'shield-checkmark'}
          size={24}
          color={isExpired ? colors.warning : colors.success}
        />
        <Text style={[styles.title, { color: colors.onSurface }]}>
          {isExpired ? t('sunscreen.reapplyNeeded') : t('sunscreen.protected')}
        </Text>
      </View>

      {/* Application info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>
          {t('sunscreen.appliedAt')}
        </Text>
        <View style={[styles.timeChip, { backgroundColor: colors.primaryContainer }]}>
          <Ionicons name="time-outline" size={16} color={colors.onPrimaryContainer} />
          <Text style={[styles.infoValue, { color: colors.onPrimaryContainer, fontWeight: '700' }]}>
            {appliedTime}
          </Text>
        </View>
      </View>

      {/* Timer display */}
      <View style={[
        styles.timerContainer,
        {
          backgroundColor: isExpired
            ? colors.warningContainer
            : colors.primaryContainer,
          borderWidth: 2,
          borderColor: isExpired ? colors.warning : colors.primary,
        }
      ]}>
        <Text
          style={[
            styles.timerText,
            {
              color: isExpired ? colors.onWarningContainer : colors.onPrimaryContainer,
            },
          ]}
        >
          {isExpired ? t('sunscreen.expired') : timeRemainingFormatted}
        </Text>
        {!isExpired && (
          <Text style={[styles.timerLabel, { color: colors.onPrimaryContainer }]}>
            {t('sunscreen.remaining')}
          </Text>
        )}
      </View>

      {/* UV Index info */}
      <View style={[styles.uvContainer, { backgroundColor: colors.surfaceVariant }]}>
        <Ionicons name="sunny" size={18} color={colors.warning} />
        <Text style={[styles.uvText, { color: colors.onSurfaceVariant, fontWeight: '600' }]}>
          UV {currentApplication.uvIndex.toFixed(1)} • {currentApplication.reapplicationMinutes}min {t('sunscreen.interval')}
        </Text>
      </View>

      {/* Swimming indicator */}
      {isSwimming && (
        <View style={[styles.swimmingBadge, { backgroundColor: colors.tertiaryContainer }]}>
          <Ionicons name="water" size={16} color={colors.tertiary} />
          <Text style={[styles.swimmingText, { color: colors.onTertiaryContainer }]}>
            {t('sunscreen.swimmingActive')}
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.buttonRow}>
        <Pressable
          style={[
            styles.secondaryButton,
            {
              borderColor: colors.outline,
            },
          ]}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel={t('sunscreen.clear')}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.onSurface }]}>
            {t('sunscreen.clear')}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.reapplyButton,
            {
              backgroundColor: isExpired
                ? colors.warning
                : colors.primary,
            },
          ]}
          onPress={handleApply}
          disabled={isApplying}
          accessibilityRole="button"
          accessibilityLabel={t('sunscreen.reapply')}
        >
          {isApplying ? (
            <ActivityIndicator size="small" color={isExpired ? colors.onWarning : colors.onPrimary} />
          ) : (
            <>
              <Ionicons name="refresh" size={20} color={isExpired ? colors.onWarning : colors.onPrimary} />
              <Text style={[styles.buttonText, { color: isExpired ? colors.onWarning : colors.onPrimary }]}>
                {t('sunscreen.reapply')}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </GlassCard>
  );
};

// Create styles function to access theme tokens
const createStyles = (typography: any, borderRadius: any, spacing: any) => StyleSheet.create({
  container: {
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
  },
  description: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    marginBottom: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: typography.fontSize.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  timerText: {
    fontSize: typography.fontSize['6xl'],
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: typography.letterSpacing.tightest,
  },
  timerLabel: {
    fontSize: typography.fontSize.sm,
    marginTop: 6,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  uvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  uvText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  swimmingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.md,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignSelf: 'center',
  },
  swimmingText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  reapplyButton: {
    flex: 1,
  },
});

