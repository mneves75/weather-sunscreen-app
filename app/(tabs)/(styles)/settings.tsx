/**
 * Settings Screen
 * User preferences and app configuration
 *
 * Modernized with:
 * - Staggered section entrance animations (80ms delay per section)
 * - Haptic feedback on all interactions (switches, toggles, resets)
 * - Spring scale animations for interactive elements
 * - Categorized glass cards for organized settings
 * - Material Design 3 transitions and polish
 * - Enhanced accessibility with reduce motion support
 * - Platform-adaptive Material fallbacks
 */

import { Divider, Text } from '@/src/components/ui';
import { SkinTypeSelector } from '@/src/components/weather';
import { useSettings } from '@/src/context/SettingsContext';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useColors, useGlassAvailability, useTheme } from '@/src/theme';
import { getStaggerDelay } from '@/src/theme/animations';
import { tokens } from '@/src/theme/tokens';
import { GlassView } from 'expo-glass-effect';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Alert, Animated, Easing, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

const { spacing, borderRadius } = tokens;

export default function SettingsScreen() {
  const colors = useColors();
  const { canUseGlass } = useGlassAvailability();
  const { themeMode, setThemeMode, highContrast, setHighContrast } = useTheme();
  const { preferences, updatePreference, resetPreferences } = useSettings();
  const { t, i18n } = useTranslation();
  const { trigger: triggerHaptic } = useHaptics();

  // Check for reduce motion accessibility preference
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );

    return () => subscription?.remove();
  }, []);

  const handleReset = useCallback(() => {
    triggerHaptic('warning');
    Alert.alert(
      t('settings.resetConfirmTitle'),
      t('settings.resetConfirmMessage'),
      [
        {
          text: t('settings.resetCancel'),
          style: 'cancel',
          onPress: () => triggerHaptic('light'),
        },
        {
          text: t('settings.resetConfirm'),
          style: 'destructive',
          onPress: () => {
            triggerHaptic('error');
            resetPreferences();
          },
        },
      ]
    );
  }, [resetPreferences, t, triggerHaptic]);

  const handleLanguageChange = useCallback(async (locale: 'en' | 'pt-BR') => {
    triggerHaptic('selection');
    await updatePreference('locale', locale);
    i18n.changeLanguage(locale);
  }, [updatePreference, i18n, triggerHaptic]);

  const timeFormatLabel = preferences.timeFormat === '24h'
    ? t('settings.timeFormat24')
    : preferences.timeFormat === '12h'
      ? t('settings.timeFormat12')
      : t('settings.timeFormatSystem');
  
  // Reusable Setting Item component
  const SettingItem = ({ 
    title, 
    subtitle, 
    onPress,
    rightElement,
    accessibilityLabel,
  }: { 
    title: string; 
    subtitle?: string; 
    onPress?: () => void;
    rightElement?: React.ReactNode;
    accessibilityLabel?: string;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={accessibilityLabel || `${title}${subtitle ? `, ${subtitle}` : ''}`}
    >
      <View style={styles.settingTextContainer}>
        <Text variant="body1" style={{ color: colors.onSurface }}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  // Animated Section wrapper with staggered entrance
  const AnimatedSettingSection = ({
    title,
    children,
    index,
    accessibilityLabel,
  }: {
    title: string;
    children: React.ReactNode;
    index: number;
    accessibilityLabel?: string;
  }) => {
    const animatedOpacity = useRef(new Animated.Value(0)).current;
    const animatedTranslateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      if (reduceMotion) {
        animatedOpacity.setValue(1);
        animatedTranslateY.setValue(0);
      } else {
        Animated.parallel([
          Animated.timing(animatedOpacity, {
            toValue: 1,
            duration: 500,
            delay: getStaggerDelay(index, 80),
            easing: Easing.bezier(0.4, 0.0, 0.2, 1.0),
            useNativeDriver: true,
          }),
          Animated.spring(animatedTranslateY, {
            toValue: 0,
            delay: getStaggerDelay(index, 80),
            damping: 15,
            stiffness: 120,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [index, reduceMotion]);

    const animatedStyle = {
      opacity: animatedOpacity,
      transform: [{ translateY: animatedTranslateY }],
    };

    return (
      <Animated.View style={animatedStyle}>
        {canUseGlass ? (
          <GlassView
            style={styles.glassSection}
            glassEffectStyle="regular"
            tintColor={colors.surfaceTint}
            accessibilityLabel={accessibilityLabel || title}
          >
            <View style={styles.sectionContent}>
              <Text variant="h3" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                {title}
              </Text>
              {children}
            </View>
          </GlassView>
        ) : (
          <View
            style={[styles.solidSection, { backgroundColor: colors.surface }]}
            accessibilityLabel={accessibilityLabel || title}
          >
            <Text variant="h3" style={[styles.sectionTitle, { color: colors.onSurface }]}>
              {title}
            </Text>
            {children}
          </View>
        )}
      </Animated.View>
    );
  };
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Appearance Section */}
      <AnimatedSettingSection
        index={0}
        title={t('settings.appearance')}
        accessibilityLabel={t('settings.appearanceSection')}
      >

        <SettingItem
          title={t('settings.theme')}
          subtitle={themeMode === 'system'
            ? t('settings.themeSystem')
            : themeMode === 'dark'
              ? t('settings.themeDark')
              : t('settings.themeLight')
          }
          onPress={() => {
            triggerHaptic('light');
            const modes = ['light', 'dark', 'system'] as const;
            const currentIndex = modes.indexOf(themeMode);
            const nextMode = modes[(currentIndex + 1) % modes.length];
            setThemeMode(nextMode);
            if (nextMode === 'dark') {
              triggerHaptic('success');
            }
          }}
          rightElement={<Text style={[styles.chevron, { color: colors.onSurfaceVariant }]}>›</Text>}
        />

        <Divider />

        <SettingItem
          title={t('settings.highContrast')}
          rightElement={
            <Switch
              value={highContrast}
              onValueChange={(value) => {
                triggerHaptic('medium');
                setHighContrast(value);
              }}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={highContrast ? colors.onPrimary : colors.onSurfaceVariant}
            />
          }
        />
      </AnimatedSettingSection>
      
      {/* Language Section */}
      <AnimatedSettingSection
        index={1}
        title={t('settings.language')}
        accessibilityLabel={t('settings.languageSection')}
      >

        <SettingItem
          title={t('settings.languageEnglish')}
          onPress={() => handleLanguageChange('en')}
          rightElement={
            preferences.locale === 'en' && (
              <Text style={{ color: colors.primary }}>✓</Text>
            )
          }
        />

        <Divider />

        <SettingItem
          title={t('settings.languagePortuguese')}
          onPress={() => handleLanguageChange('pt-BR')}
          rightElement={
            preferences.locale === 'pt-BR' && (
              <Text style={{ color: colors.primary }}>✓</Text>
            )
          }
        />
      </AnimatedSettingSection>

      {/* Units Section */}
      <AnimatedSettingSection
        index={2}
        title={t('settings.units')}
        accessibilityLabel={t('settings.unitsSection')}
      >

        <SettingItem
          title={t('settings.temperature')}
          subtitle={preferences.temperatureUnit === 'celsius' ? '°C (Celsius)' : '°F (Fahrenheit)'}
          onPress={() => {
            triggerHaptic('light');
            updatePreference(
              'temperatureUnit',
              preferences.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius'
            );
          }}
          rightElement={<Text style={[styles.chevron, { color: colors.onSurfaceVariant }]}>›</Text>}
        />

        <Divider />

        <SettingItem
          title={t('settings.windSpeed')}
          subtitle={
            preferences.speedUnit === 'kmh' ? 'km/h' :
            preferences.speedUnit === 'mph' ? 'mph' : 'm/s'
          }
          onPress={() => {
            triggerHaptic('light');
            const units = ['kmh', 'mph', 'ms'] as const;
            const currentIndex = units.indexOf(preferences.speedUnit);
            const nextUnit = units[(currentIndex + 1) % units.length];
            updatePreference('speedUnit', nextUnit);
          }}
          rightElement={<Text style={[styles.chevron, { color: colors.onSurfaceVariant }]}>›</Text>}
        />

        <Divider />

        <SettingItem
          title={t('settings.pressure')}
          subtitle={
            preferences.pressureUnit === 'hPa' ? 'hPa' :
            preferences.pressureUnit === 'inHg' ? 'inHg' : 'mmHg'
          }
          onPress={() => {
            triggerHaptic('light');
            const units = ['hPa', 'inHg', 'mmHg'] as const;
            const currentIndex = units.indexOf(preferences.pressureUnit);
            const nextUnit = units[(currentIndex + 1) % units.length];
            updatePreference('pressureUnit', nextUnit);
          }}
          rightElement={<Text style={[styles.chevron, { color: colors.onSurfaceVariant }]}>›</Text>}
        />

        <Divider />

        <SettingItem
          title={t('settings.timeFormat')}
          subtitle={timeFormatLabel}
          onPress={() => {
            triggerHaptic('light');
            const formats = ['system', '12h', '24h'] as const;
            const currentIndex = formats.indexOf(preferences.timeFormat ?? 'system');
            const nextFormat = formats[(currentIndex + 1) % formats.length];
            void updatePreference('timeFormat', nextFormat);
          }}
          rightElement={<Text style={[styles.chevron, { color: colors.onSurfaceVariant }]}>›</Text>}
        />
      </AnimatedSettingSection>
      
      {/* Skin Type Section */}
      <AnimatedSettingSection
        index={3}
        title={t('settings.uvRecommendations')}
        accessibilityLabel={t('settings.skinTypeSection')}
      >
        <SkinTypeSelector
          value={preferences.skinType}
          onChange={(type) => {
            triggerHaptic('selection');
            updatePreference('skinType', type);
          }}
          locale={preferences.locale}
        />
      </AnimatedSettingSection>

      {/* Notifications Section */}
      <AnimatedSettingSection
        index={4}
        title={t('settings.notifications')}
        accessibilityLabel={t('settings.notificationsSection')}
      >

        <SettingItem
          title={t('settings.notificationsToggle')}
          subtitle={t('settings.comingSoon')}
          rightElement={
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={(value) => {
                triggerHaptic('medium');
                updatePreference('notificationsEnabled', value);
              }}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={preferences.notificationsEnabled ? colors.onPrimary : colors.onSurfaceVariant}
              disabled
            />
          }
        />

        <Divider />

        <SettingItem
          title={t('settings.uvAlerts')}
          subtitle={t('settings.comingSoon')}
          rightElement={
            <Switch
              value={preferences.uvAlerts}
              onValueChange={(value) => {
                triggerHaptic('medium');
                updatePreference('uvAlerts', value);
              }}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={preferences.uvAlerts ? colors.onPrimary : colors.onSurfaceVariant}
              disabled
            />
          }
        />
      </AnimatedSettingSection>
      
      {/* Reset Section */}
      <TouchableOpacity
        style={[styles.resetButton, { backgroundColor: colors.errorContainer }]}
        onPress={handleReset}
      >
        <Text variant="body1" style={{ color: colors.onErrorContainer }}>
          {t('settings.reset')}
        </Text>
      </TouchableOpacity>
      
      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text variant="caption" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
          {t('settings.appName')}
        </Text>
        <Text variant="caption" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
          {t('settings.versionLabel', { version: '1.0.0' })}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  // Glass section (iOS 26+)
  glassSection: {
    borderRadius: borderRadius.xl,
    marginVertical: spacing.xs,
    overflow: 'hidden',
  },
  sectionContent: {
    padding: spacing.lg,
  },
  // Solid section (Android, iOS < 26, accessibility)
  solidSection: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  settingTextContainer: {
    flex: 1,
    gap: spacing.xxs,
  },
  chevron: {
    fontSize: 24,
  },
  resetButton: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  aboutSection: {
    marginTop: spacing.lg,
    gap: spacing.xxs,
  },
});
