import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../src/theme/theme';
import { Platform } from 'react-native';

export default function TabsLayout() {
  const { colors } = useTheme();
  const isAndroid = Platform.OS === 'android';
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: isAndroid ? 60 : 70,
          paddingBottom: isAndroid ? 8 : 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="weather" options={{ title: 'Weather' }} />
      <Tabs.Screen name="uv" options={{ title: 'UV Index' }} />
      <Tabs.Screen name="forecast" options={{ title: 'Forecast' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
