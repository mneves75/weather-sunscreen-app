/**
 * Platform-specific Icon component
 * Uses SF Symbols on iOS and Material Community Icons on Android/Web
 */

import React from 'react';
import { Platform, ViewStyle } from 'react-native';
import type { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/src/theme';
import { hasSymbolModule } from '@/src/utils/nativeAvailability';

type IconName =
  | 'home'
  | 'messages'
  | 'settings'
  | 'weather'
  | 'sun'
  | 'moon'
  | 'cloud'
  | 'rain'
  | 'snow'
  | 'wind'
  | 'humidity'
  | 'pressure'
  | 'thermometer'
  | 'location'
  | 'search'
  | 'filter'
  | 'check'
  | 'close'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'chevron-up'
  | 'arrow-right'
  | 'arrow-left'
  | 'plus'
  | 'minus'
  | 'alert'
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'delete'
  | 'edit'
  | 'share'
  | 'refresh'
  | 'calendar'
  | 'clock'
  | 'bell'
  | 'user'
  | 'map'
  | 'globe'
  | 'star';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  weight?: 'ultralight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';
  variant?: 'fill' | 'outline';
  style?: ViewStyle;
}

// Map common icon names to platform-specific variants
const iconMap: Record<IconName, { ios: string; android: string }> = {
  home: { ios: 'house', android: 'home' },
  messages: { ios: 'bubble.left', android: 'message-text' },
  settings: { ios: 'gearshape', android: 'cog' },
  weather: { ios: 'cloud.sun', android: 'weather-partly-cloudy' },
  sun: { ios: 'sun.max', android: 'white-balance-sunny' },
  moon: { ios: 'moon', android: 'moon-waning-crescent' },
  cloud: { ios: 'cloud', android: 'cloud' },
  rain: { ios: 'cloud.rain', android: 'weather-rainy' },
  snow: { ios: 'snowflake', android: 'weather-snowy' },
  wind: { ios: 'wind', android: 'weather-windy' },
  humidity: { ios: 'humidity', android: 'water-percent' },
  pressure: { ios: 'gauge', android: 'gauge' },
  thermometer: { ios: 'thermometer', android: 'thermometer' },
  location: { ios: 'location', android: 'map-marker' },
  search: { ios: 'magnifyingglass', android: 'magnify' },
  filter: { ios: 'line.3.horizontal.decrease', android: 'filter-variant' },
  check: { ios: 'checkmark', android: 'check' },
  close: { ios: 'xmark', android: 'close' },
  'chevron-right': { ios: 'chevron.right', android: 'chevron-right' },
  'chevron-left': { ios: 'chevron.left', android: 'chevron-left' },
  'chevron-down': { ios: 'chevron.down', android: 'chevron-down' },
  'chevron-up': { ios: 'chevron.up', android: 'chevron-up' },
  'arrow-right': { ios: 'arrow.right', android: 'arrow-right' },
  'arrow-left': { ios: 'arrow.left', android: 'arrow-left' },
  plus: { ios: 'plus', android: 'plus' },
  minus: { ios: 'minus', android: 'minus' },
  alert: { ios: 'exclamationmark.triangle', android: 'alert' },
  info: { ios: 'info.circle', android: 'information' },
  warning: { ios: 'exclamationmark.triangle', android: 'alert-circle' },
  error: { ios: 'xmark.circle', android: 'close-circle' },
  success: { ios: 'checkmark.circle', android: 'check-circle' },
  delete: { ios: 'trash', android: 'delete' },
  edit: { ios: 'pencil', android: 'pencil' },
  share: { ios: 'square.and.arrow.up', android: 'share-variant' },
  refresh: { ios: 'arrow.clockwise', android: 'refresh' },
  calendar: { ios: 'calendar', android: 'calendar' },
  clock: { ios: 'clock', android: 'clock-outline' },
  bell: { ios: 'bell', android: 'bell' },
  user: { ios: 'person', android: 'account' },
  map: { ios: 'map', android: 'map' },
  globe: { ios: 'globe', android: 'earth' },
  star: { ios: 'star', android: 'star' },
};

type SymbolViewComponent = React.ComponentType<SymbolViewProps> | null;

let cachedSymbolView: SymbolViewComponent | undefined;
let hasLoggedMissingSymbolModule = false;

function getSymbolView(): SymbolViewComponent {
  if (cachedSymbolView !== undefined) {
    return cachedSymbolView;
  }

  if (!hasSymbolModule()) {
    cachedSymbolView = null;
    return cachedSymbolView;
  }

  try {
    const { SymbolView } = require('expo-symbols');
    cachedSymbolView = SymbolView as SymbolViewComponent;
  } catch (error) {
    if (__DEV__ && !hasLoggedMissingSymbolModule) {
      console.warn('[Icon] expo-symbols unavailable, falling back to MaterialCommunityIcons.', error);
      hasLoggedMissingSymbolModule = true;
    }
    cachedSymbolView = null;
  }

  return cachedSymbolView;
}

export function Icon({
  name,
  size = 24,
  color,
  weight = 'regular',
  variant = 'outline',
  style,
}: IconProps) {
  const colors = useColors();
  const iconColor = color || colors.onSurface;

  const platformIcon = iconMap[name] || { ios: name, android: name };

  // iOS: Use SF Symbols
  if (Platform.OS === 'ios') {
    const SymbolView = getSymbolView();

    if (SymbolView) {
      const symbolName = variant === 'fill' ? `${platformIcon.ios}.fill` : platformIcon.ios;

      return (
        <SymbolView
          name={symbolName}
          size={size}
          tintColor={iconColor}
          weight={weight as SymbolWeight}
          style={style}
        />
      );
    }

    if (__DEV__ && !hasLoggedMissingSymbolModule) {
      console.warn('[Icon] expo-symbols module not detected, using MaterialCommunityIcons fallback.');
      hasLoggedMissingSymbolModule = true;
    }

    // Fall through to MaterialCommunityIcons below when SymbolView isn't available
  }

  // Android/Web: Use Material Community Icons
  return (
    <MaterialCommunityIcons
      name={platformIcon.android as any}
      size={size}
      color={iconColor}
      style={style}
    />
  );
}