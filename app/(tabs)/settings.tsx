import React from 'react';
import { View, Text } from 'react-native';
import Button from '../../src/components/ui/Button';
import { useTheme } from '../../src/theme/theme';
import { changeLanguage, getCurrentLanguage } from '../../src/i18n';
import { useAppStore } from '../../src/store/appStore';

export default function SettingsScreen() {
  const { scheme, setScheme } = useTheme();
  const { highContrast, setHighContrast } = useTheme();
  const perfOverlay = useAppStore((s) => s.perfOverlay);
  const setPerfOverlay = useAppStore((s) => s.setPerfOverlay);
  const next = scheme === 'light' ? 'dark' : 'light';
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text accessibilityRole="header" style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Settings
      </Text>
      <Text style={{ marginBottom: 12 }}>Tema atual: {scheme}</Text>
      <Button
        label={`Trocar para ${next}`}
        onPress={() => setScheme(next)}
        accessibilityLabel="Alternar tema"
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
