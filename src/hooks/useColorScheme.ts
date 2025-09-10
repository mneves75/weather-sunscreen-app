import { useColorScheme as useRNColorScheme, ColorSchemeName } from 'react-native';

export function useColorScheme(): NonNullable<ColorSchemeName> {
  return (useRNColorScheme() || 'light') as NonNullable<ColorSchemeName>;
}
