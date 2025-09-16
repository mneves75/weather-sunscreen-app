import React from 'react';
import { Stack } from 'expo-router';
import AppProviders from '../src/theme/AppProviders';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Modal',
          }}
        />
        <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="(dev)" options={{ headerShown: true, title: 'Dev Tools' }} />
        <Stack.Screen name="forecast/[day]" options={{ presentation: 'card' }} />
      </Stack>
    </AppProviders>
  );
}
