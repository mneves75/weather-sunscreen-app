/**
 * Messages Stack Navigator Layout
 * Navigation for messages (placeholder)
 */

import { useColors } from '@/src/theme/theme';
import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function MessagesStackLayout() {
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
          title: t('screens.messages', 'Messages'),
          headerLargeTitle: true,
        }}
      />
    </Stack>
  );
}
