/**
 * Settings Screen
 * User preferences and app configuration
 */

import { Divider, Text } from '@/src/components/ui';
import { SkinTypeSelector } from '@/src/components/weather';
import { useSettings } from '@/src/context/SettingsContext';
import { useColors, useTheme } from '@/src/theme/theme';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const colors = useColors();
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
  
  const SettingItem = ({ 
    title, 
    subtitle, 
    onPress,
    rightElement,
  }: { 
    title: string; 
    subtitle?: string; 
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
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
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Appearance Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text variant="h3" style={[styles.sectionTitle, { color: colors.onSurface }]}>
          {preferences.locale === 'pt-BR' ? 'Aparência' : 'Appearance'}
        </Text>
        
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
      </View>
      
      {/* Language Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text variant="h3" style={[styles.sectionTitle, { color: colors.onSurface }]}>
          {preferences.locale === 'pt-BR' ? 'Idioma' : 'Language'}
        </Text>
        
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
      </View>
      
      {/* Units Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text variant="h3" style={[styles.sectionTitle, { color: colors.onSurface }]}>
          {preferences.locale === 'pt-BR' ? 'Unidades' : 'Units'}
        </Text>
        
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
      </View>
      
      {/* Skin Type Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text variant="h3" style={[styles.sectionTitle, { color: colors.onSurface }]}>
          {preferences.locale === 'pt-BR' ? 'Recomendações UV' : 'UV Recommendations'}
        </Text>
        
        <SkinTypeSelector
          value={preferences.skinType}
          onChange={(type) => updatePreference('skinType', type)}
          locale={preferences.locale}
        />
      </View>
      
      {/* Notifications Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text variant="h3" style={[styles.sectionTitle, { color: colors.onSurface }]}>
          {preferences.locale === 'pt-BR' ? 'Notificações' : 'Notifications'}
        </Text>
        
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
      </View>
      
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
  section: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
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
