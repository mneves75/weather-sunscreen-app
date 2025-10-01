/**
 * Tab Navigation Layout
 * Main tab bar with Home, Messages, and Styles tabs
 */

import { useColors } from '@/src/theme/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Tab bar icon component
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colors = useColors();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outlineVariant,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.onSurface,
        headerShadowVisible: false,
      }}>
      {/* Home Tab (nested stack) */}
      <Tabs.Screen
        name="(home)"
        options={{
          title: t('tabs.home', 'Home'),
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: false,
        }}
      />
      
      {/* Messages Tab (placeholder) */}
      <Tabs.Screen
        name="(messages)"
        options={{
          title: t('tabs.messages', 'Messages'),
          tabBarIcon: ({ color }) => <TabBarIcon name="comment" color={color} />,
          headerShown: false,
        }}
      />
      
      {/* Styles/Settings Tab */}
      <Tabs.Screen
        name="(styles)"
        options={{
          title: t('tabs.settings', 'Settings'),
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
          headerShown: false,
        }}
      />
      
      {/* Hide old placeholder tabs */}
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
