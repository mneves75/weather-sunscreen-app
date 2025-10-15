/**
 * Native Tab Navigation Layout
 * Main tab bar with Home and Settings tabs using native system tab bar
 * Uses SF Symbols for iOS and platform-specific icons for Android
 *
 * iOS 26+ Features:
 * - Liquid Glass tab bar with dynamic colors
 * - Tab bar minimize on scroll down
 * - Automatic scroll to top on tab repress
 *
 * @see https://docs.expo.dev/router/advanced/native-tabs/
 */

import { useColors } from '@/src/theme/theme';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicColorIOS, Platform } from 'react-native';

export default function TabLayout() {
  const colors = useColors();
  const { t } = useTranslation();

  return (
    <NativeTabs
      // iOS 26+: Tab bar minimizes when scrolling down
      minimizeBehavior="onScrollDown"
      // iOS liquid glass support with dynamic colors
      labelStyle={{
        color: Platform.OS === 'ios'
          ? DynamicColorIOS({ dark: 'white', light: 'black' })
          : colors.onSurface,
        // @ts-ignore - tintColor is valid for NativeTabs
        tintColor: Platform.OS === 'ios'
          ? DynamicColorIOS({ dark: colors.primary, light: colors.primary })
          : colors.primary,
      }}
      // Android-specific styling
      tabBarStyle={Platform.OS === 'android' ? {
        backgroundColor: colors.surface,
        borderTopColor: colors.outlineVariant,
      } : undefined}
    >
      {/* Home Tab - Weather and related screens */}
      <NativeTabs.Trigger
        name="(home)"
        // iOS: Tapping when active scrolls to top
        disableScrollToTop={false}
        // iOS: Tapping when active pops to root
        disablePopToTop={false}
      >
        <Label>{t('tabs.home', 'Home')}</Label>
        <Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          // For Android, you can add custom drawables if available
          // drawable="home_drawable"
        />
      </NativeTabs.Trigger>

      {/* Settings Tab - App customization and preferences */}
      <NativeTabs.Trigger name="(styles)">
        <Label>{t('tabs.settings', 'Settings')}</Label>
        <Icon
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          // For Android, you can add custom drawables if available
          // drawable="settings_drawable"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
