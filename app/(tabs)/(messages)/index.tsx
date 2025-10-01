/**
 * Messages Screen
 * Notification hub and messaging center (coming soon)
 */

import { Card, Divider, Text } from '@/src/components/ui';
import { useSettings } from '@/src/context/SettingsContext';
import { useColors } from '@/src/theme/theme';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

export default function MessagesScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const { preferences, updatePreference } = useSettings();

  const handleToggleNotifications = useCallback(
    (value: boolean) => {
      updatePreference('notificationsEnabled', value);
    },
    [updatePreference]
  );

  const handleToggleUVAlerts = useCallback(
    (value: boolean) => {
      updatePreference('uvAlerts', value);
    },
    [updatePreference]
  );

  const handleToggleWeatherAlerts = useCallback(
    (value: boolean) => {
      updatePreference('weatherAlerts', value);
    },
    [updatePreference]
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Coming Soon Section */}
      <Card elevated style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Text
            variant="h1"
            style={[styles.heroEmoji, { color: colors.primary }]}
            accessibilityLabel={t('messages.comingSoon')}
          >
            💬
          </Text>
          <Text
            variant="h2"
            style={[styles.heroTitle, { color: colors.onSurface }]}
          >
            {t('messages.comingSoon')}
          </Text>
          <Text
            variant="body1"
            style={[styles.heroDescription, { color: colors.onSurfaceVariant }]}
          >
            {t('messages.description')}
          </Text>
          <Text
            variant="caption"
            style={[styles.heroDate, { color: colors.primary }]}
          >
            {t('messages.targetDate')}
          </Text>
        </View>
      </Card>

      {/* Notification Preferences Section */}
      <Card style={styles.section}>
        <Text variant="h3" style={[styles.sectionTitle, { color: colors.onSurface }]}>
          {t('settings.notifications')}
        </Text>
        <Text
          variant="body2"
          style={[styles.sectionSubtitle, { color: colors.onSurfaceVariant }]}
        >
          {preferences.locale === 'pt-BR'
            ? 'Configure suas preferências de notificações para quando o recurso estiver disponível.'
            : 'Configure your notification preferences for when the feature becomes available.'}
        </Text>

        <View style={styles.settingsList}>
          {/* Enable Notifications Toggle */}
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text variant="body1" style={{ color: colors.onSurface }}>
                {preferences.locale === 'pt-BR' ? 'Ativar Notificações' : 'Enable Notifications'}
              </Text>
              <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
                {preferences.locale === 'pt-BR'
                  ? 'Receba notificações sobre clima e UV'
                  : 'Receive weather and UV notifications'}
              </Text>
            </View>
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={preferences.notificationsEnabled ? colors.onPrimary : colors.onSurfaceVariant}
              accessibilityRole="switch"
              accessibilityLabel={preferences.locale === 'pt-BR' ? 'Ativar Notificações' : 'Enable Notifications'}
              accessibilityState={{ checked: preferences.notificationsEnabled }}
            />
          </View>

          <Divider />

          {/* UV Alerts Toggle */}
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text variant="body1" style={{ color: colors.onSurface }}>
                {preferences.locale === 'pt-BR' ? 'Alertas de UV' : 'UV Alerts'}
              </Text>
              <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
                {preferences.locale === 'pt-BR'
                  ? 'Avisos quando o índice UV estiver alto'
                  : 'Warnings when UV index is high'}
              </Text>
            </View>
            <Switch
              value={preferences.uvAlerts}
              onValueChange={handleToggleUVAlerts}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={preferences.uvAlerts ? colors.onPrimary : colors.onSurfaceVariant}
              disabled={!preferences.notificationsEnabled}
              accessibilityRole="switch"
              accessibilityLabel={preferences.locale === 'pt-BR' ? 'Alertas de UV' : 'UV Alerts'}
              accessibilityState={{ 
                checked: preferences.uvAlerts,
                disabled: !preferences.notificationsEnabled 
              }}
            />
          </View>

          <Divider />

          {/* Weather Alerts Toggle */}
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text variant="body1" style={{ color: colors.onSurface }}>
                {preferences.locale === 'pt-BR' ? 'Alertas Meteorológicos' : 'Weather Alerts'}
              </Text>
              <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
                {preferences.locale === 'pt-BR'
                  ? 'Avisos sobre mudanças climáticas significativas'
                  : 'Warnings about significant weather changes'}
              </Text>
            </View>
            <Switch
              value={preferences.weatherAlerts}
              onValueChange={handleToggleWeatherAlerts}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={preferences.weatherAlerts ? colors.onPrimary : colors.onSurfaceVariant}
              disabled={!preferences.notificationsEnabled}
              accessibilityRole="switch"
              accessibilityLabel={preferences.locale === 'pt-BR' ? 'Alertas Meteorológicos' : 'Weather Alerts'}
              accessibilityState={{ 
                checked: preferences.weatherAlerts,
                disabled: !preferences.notificationsEnabled 
              }}
            />
          </View>
        </View>
      </Card>

      {/* Info Section */}
      <Card style={styles.infoCard}>
        <Text variant="body2" style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
          {preferences.locale === 'pt-BR'
            ? '💡 As notificações serão habilitadas quando o recurso de mensagens for lançado. Suas preferências serão salvas.'
            : '💡 Notifications will be enabled when the messaging feature launches. Your preferences will be saved.'}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    marginBottom: 16,
  },
  heroContent: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  heroTitle: {
    textAlign: 'center',
  },
  heroDescription: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  heroDate: {
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionSubtitle: {
    marginBottom: 20,
    lineHeight: 20,
  },
  settingsList: {
    gap: 0,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  settingTextContainer: {
    flex: 1,
    gap: 4,
  },
  infoCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  infoText: {
    lineHeight: 20,
  },
});

