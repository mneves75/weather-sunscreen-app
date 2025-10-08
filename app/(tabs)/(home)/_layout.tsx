/**
 * Home Stack Navigator Layout
 * Navigation for weather-related screens
 */

import { useColors } from '@/src/theme/theme';
import { Stack } from 'expo-router';
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
          title: t('weather.title', 'Weather'),
        }}
      />
      <Stack.Screen
        name="weather"
        options={{
          title: t('weather.title', 'Weather Details'),
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="uv"
        options={{
          title: t('uv.title', 'UV Index'),
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="forecast"
        options={{
          title: t('forecast.sevenDay', '7-Day Forecast'),
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
