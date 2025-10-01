/**
 * Home Stack Navigator Layout
 * Navigation for weather-related screens
 */

import { useColors } from '@/src/theme/theme';
import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function HomeStackLayout() {
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
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('screens.home', 'Weather'),
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="weather"
        options={{
          title: t('screens.weather', 'Weather Details'),
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="uv"
        options={{
          title: t('screens.uv', 'UV Index'),
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="forecast"
        options={{
          title: t('screens.forecast', '7-Day Forecast'),
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
