/**
 * Sunscreen Tracker Component
 * Displays sunscreen application status and reapplication timer
 * Allows user to track when they applied sunscreen and get alerts
 */

import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSunscreen } from '../../context/SunscreenContext';
import { useColors } from '../../theme/theme';
import { GlassCard } from '../glass/GlassCard';
import { logger } from '../../services/LoggerService';

export const SunscreenTracker: React.FC = () => {
  const { t } = useTranslation();
  const colors = useColors();
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
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <Text style={[styles.infoValue, { color: colors.primary, fontWeight: '700' }]}>
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
              color: isExpired ? colors.warning : colors.primary,
            },
          ]}
        >
          {isExpired ? t('sunscreen.expired') : timeRemainingFormatted}
        </Text>
        {!isExpired && (
          <Text style={[styles.timerLabel, { color: colors.primary }]}>
            {t('sunscreen.remaining')}
          </Text>
        )}
      </View>

      {/* UV Index info */}
      <View style={[styles.uvContainer, { backgroundColor: colors.surfaceVariant }]}>
        <Ionicons name="sunny" size={18} color={colors.warning} />
        <Text style={[styles.uvText, { color: colors.onSurface, fontWeight: '600' }]}>
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
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <>
              <Ionicons name="refresh" size={20} color={colors.onPrimary} />
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                {t('sunscreen.reapply')}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  timerLabel: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  uvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  uvText: {
    fontSize: 13,
    fontWeight: '600',
  },
  swimmingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'center',
  },
  swimmingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reapplyButton: {
    flex: 1,
  },
});

