/**
 * Settings Screen
 * User preferences and app configuration
 * 
 * Modernized with:
 * - Categorized glass cards for organized settings
 * - Expo UI toggle patterns (Switch components)
 * - Consistent typography with theme tokens
 * - Enhanced accessibility labels and roles
 * - Platform-adaptive Material fallbacks
 */

import { Divider, Text } from '@/src/components/ui';
import { SkinTypeSelector } from '@/src/components/weather';
import { useSettings } from '@/src/context/SettingsContext';
import { useColors, useGlassAvailability, useTheme } from '@/src/theme';
import { GlassView } from 'expo-glass-effect';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const colors = useColors();
  const { canUseGlass } = useGlassAvailability();
  const { themeMode, setThemeMode, highContrast, setHighContrast } = useTheme();
  const { preferences, updatePreference, resetPreferences } = useSettings();
  const { t, i18n } = useTranslation();
  
  const handleReset = useCallback(() => {
    Alert.alert(
      preferences.locale === 'pt-BR' ? 'Redefinir Configurações' : 'Reset Settings',
      preferences.locale === 'pt-BR'
        ? 'Tem certeza de que deseja redefinir todas as configurações para os padrões?'
        : 'Are you sure you want to reset all settings to defaults?',
      [
        {
          text: preferences.locale === 'pt-BR' ? 'Cancelar' : 'Cancel',
          style: 'cancel',
        },
        {
          text: preferences.locale === 'pt-BR' ? 'Redefinir' : 'Reset',
          style: 'destructive',
          onPress: resetPreferences,
        },
      ]
    );
  }, [preferences.locale, resetPreferences]);
  
  const handleLanguageChange = useCallback(async (locale: 'en' | 'pt-BR') => {
    await updatePreference('locale', locale);
    i18n.changeLanguage(locale);
  }, [updatePreference, i18n]);

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

  // Reusable Section wrapper with glass/solid variants
  const SettingSection = ({ 
    title, 
    children,
    accessibilityLabel,
  }: { 
    title: string; 
    children: React.ReactNode;
    accessibilityLabel?: string;
  }) => (
    canUseGlass ? (
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
    )
  );
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Appearance Section */}
      <SettingSection 
        title={t('settings.appearance', preferences.locale === 'pt-BR' ? 'Aparência' : 'Appearance')}
        accessibilityLabel={t('settings.appearanceSection', 'Appearance settings')}
      >
        
        <SettingItem
          title={preferences.locale === 'pt-BR' ? 'Tema' : 'Theme'}
          subtitle={themeMode === 'system' 
            ? (preferences.locale === 'pt-BR' ? 'Sistema' : 'System')
            : themeMode === 'dark'
              ? (preferences.locale === 'pt-BR' ? 'Escuro' : 'Dark')
              : (preferences.locale === 'pt-BR' ? 'Claro' : 'Light')
          }
          onPress={() => {
            const modes = ['light', 'dark', 'system'] as const;
            const currentIndex = modes.indexOf(themeMode);
            const nextMode = modes[(currentIndex + 1) % modes.length];
            setThemeMode(nextMode);
          }}
          rightElement={<Text style={styles.chevron}>›</Text>}
        />
        
        <Divider />
        
        <SettingItem
          title={preferences.locale === 'pt-BR' ? 'Alto Contraste' : 'High Contrast'}
          rightElement={
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={highContrast ? colors.onPrimary : colors.onSurfaceVariant}
            />
          }
        />
      </SettingSection>
      
      {/* Language Section */}
      <SettingSection 
        title={t('settings.language', preferences.locale === 'pt-BR' ? 'Idioma' : 'Language')}
        accessibilityLabel={t('settings.languageSection', 'Language settings')}
      >
        
        <SettingItem
          title="English"
          onPress={() => handleLanguageChange('en')}
          rightElement={
            preferences.locale === 'en' && (
              <Text style={{ color: colors.primary }}>✓</Text>
            )
          }
        />
        
        <Divider />
        
        <SettingItem
          title="Português (Brasil)"
          onPress={() => handleLanguageChange('pt-BR')}
          rightElement={
            preferences.locale === 'pt-BR' && (
              <Text style={{ color: colors.primary }}>✓</Text>
            )
          }
        />
      </SettingSection>
      
      {/* Units Section */}
      <SettingSection 
        title={t('settings.units', preferences.locale === 'pt-BR' ? 'Unidades' : 'Units')}
        accessibilityLabel={t('settings.unitsSection', 'Units settings')}
      >
        
        <SettingItem
          title={preferences.locale === 'pt-BR' ? 'Temperatura' : 'Temperature'}
          subtitle={preferences.temperatureUnit === 'celsius' ? '°C (Celsius)' : '°F (Fahrenheit)'}
          onPress={() => updatePreference(
            'temperatureUnit', 
            preferences.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius'
          )}
          rightElement={<Text style={styles.chevron}>›</Text>}
        />
        
        <Divider />
        
        <SettingItem
          title={preferences.locale === 'pt-BR' ? 'Velocidade do Vento' : 'Wind Speed'}
          subtitle={
            preferences.speedUnit === 'kmh' ? 'km/h' :
            preferences.speedUnit === 'mph' ? 'mph' : 'm/s'
          }
          onPress={() => {
            const units = ['kmh', 'mph', 'ms'] as const;
            const currentIndex = units.indexOf(preferences.speedUnit);
            const nextUnit = units[(currentIndex + 1) % units.length];
            updatePreference('speedUnit', nextUnit);
          }}
          rightElement={<Text style={styles.chevron}>›</Text>}
        />
        
        <Divider />
        
        <SettingItem
          title={preferences.locale === 'pt-BR' ? 'Pressão' : 'Pressure'}
          subtitle={
            preferences.pressureUnit === 'hPa' ? 'hPa' :
            preferences.pressureUnit === 'inHg' ? 'inHg' : 'mmHg'
          }
          onPress={() => {
            const units = ['hPa', 'inHg', 'mmHg'] as const;
            const currentIndex = units.indexOf(preferences.pressureUnit);
            const nextUnit = units[(currentIndex + 1) % units.length];
            updatePreference('pressureUnit', nextUnit);
          }}
          rightElement={<Text style={styles.chevron}>›</Text>}
        />

        <Divider />

        <SettingItem
          title={t('settings.timeFormat')}
          subtitle={timeFormatLabel}
          onPress={() => {
            const formats = ['system', '12h', '24h'] as const;
            const currentIndex = formats.indexOf(preferences.timeFormat ?? 'system');
            const nextFormat = formats[(currentIndex + 1) % formats.length];
            void updatePreference('timeFormat', nextFormat);
          }}
          rightElement={<Text style={styles.chevron}>›</Text>}
        />
      </SettingSection>
      
      {/* Skin Type Section */}
      <SettingSection 
        title={t('settings.uvRecommendations', preferences.locale === 'pt-BR' ? 'Recomendações UV' : 'UV Recommendations')}
        accessibilityLabel={t('settings.skinTypeSection', 'UV recommendations and skin type')}
      >
        <SkinTypeSelector
          value={preferences.skinType}
          onChange={(type) => updatePreference('skinType', type)}
          locale={preferences.locale}
        />
      </SettingSection>
      
      {/* Notifications Section */}
      <SettingSection 
        title={t('settings.notifications', preferences.locale === 'pt-BR' ? 'Notificações' : 'Notifications')}
        accessibilityLabel={t('settings.notificationsSection', 'Notification settings')}
      >
        
        <SettingItem
          title={preferences.locale === 'pt-BR' ? 'Notificações' : 'Notifications'}
          subtitle={preferences.locale === 'pt-BR' ? 'Em breve' : 'Coming soon'}
          rightElement={
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={(value) => updatePreference('notificationsEnabled', value)}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={preferences.notificationsEnabled ? colors.onPrimary : colors.onSurfaceVariant}
              disabled
            />
          }
        />
        
        <Divider />
        
        <SettingItem
          title={preferences.locale === 'pt-BR' ? 'Alertas UV' : 'UV Alerts'}
          subtitle={preferences.locale === 'pt-BR' ? 'Em breve' : 'Coming soon'}
          rightElement={
            <Switch
              value={preferences.uvAlerts}
              onValueChange={(value) => updatePreference('uvAlerts', value)}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={preferences.uvAlerts ? colors.onPrimary : colors.onSurfaceVariant}
              disabled
            />
          }
        />
      </SettingSection>
      
      {/* Reset Section */}
      <TouchableOpacity
        style={[styles.resetButton, { backgroundColor: colors.errorContainer }]}
        onPress={handleReset}
      >
        <Text variant="body1" style={{ color: colors.onErrorContainer }}>
          {preferences.locale === 'pt-BR' ? 'Redefinir Configurações' : 'Reset Settings'}
        </Text>
      </TouchableOpacity>
      
      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text variant="caption" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
          Weather Sunscreen App
        </Text>
        <Text variant="caption" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
          Version 1.0.0
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
    padding: 16,
    paddingBottom: 32,
  },
  // Glass section (iOS 26+)
  glassSection: {
    borderRadius: 20,
    marginVertical: 8,
    overflow: 'hidden',
  },
  sectionContent: {
    padding: 20,
  },
  // Solid section (Android, iOS < 26, accessibility)
  solidSection: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
    gap: 4,
  },
  chevron: {
    fontSize: 24,
    opacity: 0.5,
  },
  resetButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  aboutSection: {
    marginTop: 24,
    gap: 4,
  },
});
