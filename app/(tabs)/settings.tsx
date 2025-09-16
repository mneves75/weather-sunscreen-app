import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Button from '../../src/components/ui/Button';
import { useTheme } from '../../src/theme/theme';
import { changeLanguage, getCurrentLanguage } from '../../src/i18n';
import { useAppStore } from '../../src/store/appStore';

export default function SettingsScreen() {
  const { scheme, themeMode, setThemeMode, toggleTheme, highContrast, setHighContrast, colors } =
    useTheme();
  const perfOverlay = useAppStore((s) => s.perfOverlay);
  const setPerfOverlay = useAppStore((s) => s.setPerfOverlay);
  const themeOptions: Array<{ value: typeof themeMode; label: string }> = [
    { value: 'system', label: 'Sistema' },
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Escuro' },
  ];
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text accessibilityRole="header" style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Settings
      </Text>
      <Text style={{ marginBottom: 12 }}>
        Tema atual: {themeMode === 'system' ? 'Sistema' : scheme}
      </Text>
      <View
        style={[
          styles.segmentContainer,
          { backgroundColor: colors.surface, borderColor: colors.cardBorder },
        ]}
        accessibilityRole="radiogroup"
      >
        {themeOptions.map((option) => {
          const selected = themeMode === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setThemeMode(option.value)}
              style={[styles.segmentButton, selected && { backgroundColor: colors.accent }]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  selected && { color: '#FFFFFF' },
                  !selected && { color: colors.primary },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Button
        label="Alternar rapidamente"
        onPress={toggleTheme}
        accessibilityLabel="Alternar tema de forma rápida"
        style={{ marginTop: 12 }}
      />

      <View style={{ height: 12 }} />
      <Text style={{ marginBottom: 12 }}>Alto contraste: {highContrast ? 'on' : 'off'}</Text>
      <Button
        label={highContrast ? 'Desligar contraste' : 'Ativar contraste'}
        onPress={() => setHighContrast(!highContrast)}
        accessibilityLabel="Alternar alto contraste"
      />

      <View style={{ height: 12 }} />
      <Text style={{ marginBottom: 12 }}>Idioma: {getCurrentLanguage()}</Text>
      <Button
        label="PT-BR"
        onPress={() => changeLanguage('pt-BR')}
        accessibilityLabel="Mudar para Português"
      />
      <View style={{ height: 8 }} />
      <Button
        label="EN"
        onPress={() => changeLanguage('en')}
        accessibilityLabel="Change to English"
      />

      <View style={{ height: 12 }} />
      <Text style={{ marginBottom: 12 }}>Perf overlay (dev): {perfOverlay ? 'on' : 'off'}</Text>
      <Button
        label={perfOverlay ? 'Hide overlay' : 'Show overlay'}
        onPress={() => setPerfOverlay(!perfOverlay)}
        accessibilityLabel="Alternar overlay de performance"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#2563EB',
  },
  segmentLabel: {
    fontWeight: '600',
  },
});
