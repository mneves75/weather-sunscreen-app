/**
 * Messages Stack Navigator Layout
 * Navigation for messages with detail view
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
          title: t('messages.title', 'Messages'),
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="detail"
        options={{
          title: t('messages.detail.title', 'Message'),
          presentation: 'modal',
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
