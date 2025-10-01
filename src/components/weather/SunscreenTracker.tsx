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
import { useTheme } from '../../context/WeatherContext';
import { GlassCard } from '../glass/GlassCard';

export const SunscreenTracker: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
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
      console.error('Failed to apply sunscreen:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearApplication();
    } catch (error) {
      console.error('Failed to clear application:', error);
    }
  };

  if (isLoading) {
    return (
      <GlassCard style={styles.container}>
        <ActivityIndicator size="small" color={theme.colors.text.primary} />
      </GlassCard>
    );
  }

  // No active application
  if (!currentApplication) {
    return (
      <GlassCard style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="sunny" size={24} color={theme.colors.text.primary} />
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {t('sunscreen.title')}
          </Text>
        </View>

        <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
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
                  ? theme.colors.accent.primary
                  : 'transparent',
                borderColor: theme.colors.accent.primary,
              },
            ]}
          >
            {isSwimming && (
              <Ionicons name="checkmark" size={16} color={theme.colors.background.primary} />
            )}
          </View>
          <Text style={[styles.toggleLabel, { color: theme.colors.text.primary }]}>
            {t('sunscreen.swimmingMode')}
          </Text>
        </Pressable>

        {/* Apply button */}
        <Pressable
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.accent.primary,
            },
          ]}
          onPress={handleApply}
          disabled={isApplying}
          accessibilityRole="button"
          accessibilityLabel={t('sunscreen.apply')}
        >
          {isApplying ? (
            <ActivityIndicator size="small" color={theme.colors.background.primary} />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={20} color={theme.colors.background.primary} />
              <Text style={[styles.buttonText, { color: theme.colors.background.primary }]}>
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
          color={isExpired ? theme.colors.status.warning : theme.colors.status.success}
        />
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          {isExpired ? t('sunscreen.reapplyNeeded') : t('sunscreen.protected')}
        </Text>
      </View>

      {/* Application info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>
          {t('sunscreen.appliedAt')}
        </Text>
        <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
          {appliedTime}
        </Text>
      </View>

      {/* Timer display */}
      <View style={styles.timerContainer}>
        <Text
          style={[
            styles.timerText,
            {
              color: isExpired ? theme.colors.status.warning : theme.colors.accent.primary,
            },
          ]}
        >
          {isExpired ? t('sunscreen.expired') : timeRemainingFormatted}
        </Text>
        {!isExpired && (
          <Text style={[styles.timerLabel, { color: theme.colors.text.secondary }]}>
            {t('sunscreen.remaining')}
          </Text>
        )}
      </View>

      {/* UV Index info */}
      <View style={styles.uvContainer}>
        <Ionicons name="sunny-outline" size={16} color={theme.colors.text.secondary} />
        <Text style={[styles.uvText, { color: theme.colors.text.secondary }]}>
          UV {currentApplication.uvIndex.toFixed(1)} • {currentApplication.reapplicationMinutes}min {t('sunscreen.interval')}
        </Text>
      </View>

      {/* Swimming indicator */}
      {isSwimming && (
        <View style={styles.swimmingBadge}>
          <Ionicons name="water" size={14} color={theme.colors.accent.secondary} />
          <Text style={[styles.swimmingText, { color: theme.colors.accent.secondary }]}>
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
              borderColor: theme.colors.text.secondary,
            },
          ]}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel={t('sunscreen.clear')}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.colors.text.secondary }]}>
            {t('sunscreen.clear')}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.reapplyButton,
            {
              backgroundColor: isExpired
                ? theme.colors.status.warning
                : theme.colors.accent.primary,
            },
          ]}
          onPress={handleApply}
          disabled={isApplying}
          accessibilityRole="button"
          accessibilityLabel={t('sunscreen.reapply')}
        >
          {isApplying ? (
            <ActivityIndicator size="small" color={theme.colors.background.primary} />
          ) : (
            <>
              <Ionicons name="refresh" size={20} color={theme.colors.background.primary} />
              <Text style={[styles.buttonText, { color: theme.colors.background.primary }]}>
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
    fontSize: 14,
    fontWeight: '500',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  timerText: {
    fontSize: 36,
    fontWeight: '700',
  },
  timerLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  uvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  uvText: {
    fontSize: 12,
  },
  swimmingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  swimmingText: {
    fontSize: 12,
    fontWeight: '500',
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

