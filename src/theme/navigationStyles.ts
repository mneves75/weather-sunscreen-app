import { Platform, StyleSheet, ViewStyle } from 'react-native';
import { tokens } from './tokens';
import { applyOpacity } from './colorUtils';

type ThemeColors = { [K in keyof typeof tokens.light.colors]: string };

export type NavigationStyles = {
  tabBarStyle: ViewStyle;
  itemStyle?: ViewStyle;
  activeTintColor: string;
  inactiveTintColor: string;
  activeBackgroundColor?: string;
  useGlassBackground: boolean;
  labelFontWeight: '500' | '600';
};

export function buildNavigationStyles(
  colors: ThemeColors,
  platform: string = Platform.OS,
): NavigationStyles {
  if (platform === 'android') {
    return {
      tabBarStyle: {
        backgroundColor: colors.surface,
        height: 56,
        borderTopWidth: 0,
        elevation: 0,
        paddingHorizontal: 12,
      },
      itemStyle: {
        borderRadius: 16,
        marginHorizontal: 4,
      },
      activeTintColor: colors.accent,
      inactiveTintColor: colors.secondary,
      activeBackgroundColor: applyOpacity(colors.accent, 0.12),
      useGlassBackground: false,
      labelFontWeight: '600',
    };
  }

  if (platform === 'ios') {
    return {
      tabBarStyle: {
        backgroundColor: 'transparent',
        borderTopColor: applyOpacity(colors.border, 0.35),
        borderTopWidth: StyleSheet.hairlineWidth,
        position: 'absolute',
        paddingHorizontal: 12,
      },
      itemStyle: {
        borderRadius: 18,
        marginHorizontal: 6,
        paddingVertical: 6,
      },
      activeTintColor: colors.primary,
      inactiveTintColor: colors.secondary,
      useGlassBackground: true,
      labelFontWeight: '600',
    };
  }

  return {
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    activeTintColor: colors.primary,
    inactiveTintColor: colors.secondary,
    useGlassBackground: false,
    labelFontWeight: '600',
  };
}
