/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 *
 * Note: These are legacy components from Expo scaffold.
 * Prefer using components from @/src/components with the new theme system.
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';
import { useColorScheme } from './useColorScheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

// Default colors for legacy components (migrated from deleted Colors.ts)
const defaultColors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: '#007AFF',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: '#0A84FF',
  },
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof defaultColors.light
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return defaultColors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
