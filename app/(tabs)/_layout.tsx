import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../src/theme/theme';
import { StyleSheet, Platform } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { buildNavigationStyles } from '../../src/theme/navigationStyles';

export default function TabsLayout() {
  const { colors } = useTheme();
  const navStyles = useMemo(() => buildNavigationStyles(colors), [colors]);
  const backgroundRenderer = navStyles.useGlassBackground
    ? () => <GlassView glassEffectStyle="regular" style={StyleSheet.absoluteFillObject} />
    : undefined;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: navStyles.activeTintColor,
        tabBarInactiveTintColor: navStyles.inactiveTintColor,
        tabBarStyle: navStyles.tabBarStyle,
        tabBarItemStyle: navStyles.itemStyle,
        tabBarActiveBackgroundColor: navStyles.activeBackgroundColor,
        tabBarLabelStyle: { fontSize: 12, fontWeight: navStyles.labelFontWeight },
        ...(backgroundRenderer ? { tabBarBackground: backgroundRenderer } : {}),
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
