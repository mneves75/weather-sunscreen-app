/**
 * Styles/Settings Stack Navigator Layout
 * Navigation for settings and customization
 */

import { useColors } from '@/src/theme/theme';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function StylesStackLayout() {
  const colors = useColors();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.onSurface,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('common.settings', 'Settings'),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: t('common.settings', 'Settings'),
        }}
      />
    </Stack>
  );
}
