import React, { ReactNode, useMemo } from 'react';
import { View, ViewStyle, Platform, StyleProp } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { ColorScheme } from '../../types/theme';
import { appendAlpha } from '../../utils/color';

type Variant = 'regular' | 'prominent' | 'thin' | 'glassProminent' | 'glass';

interface LiquidGlassWrapperProps {
  children: ReactNode;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}

// Optional Expo Glass Effect (SDK feature). Loaded dynamically if installed.
type GlassModule = {
  GlassContainer?: React.ComponentType<{ style?: StyleProp<ViewStyle>; children?: ReactNode }>;
};

function tryRequireGlassEffect(): GlassModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-glass-effect') as GlassModule;
    return mod ?? null;
  } catch {
    return null;
  }
}

export function LiquidGlassWrapper({
  children,
  variant = 'regular',
  style,
}: LiquidGlassWrapperProps) {
  const colors = useColors();

  // iOS: If Expo Glass Effect is available, prefer it.
  const glass = useMemo(tryRequireGlassEffect, []);
  if (Platform.OS === 'ios' && glass?.GlassContainer) {
    const GlassContainer = glass.GlassContainer;
    return <GlassContainer style={style}>{children}</GlassContainer>;
  }

  // Android Material 3 and Web fallback
  return <View style={[getMaterial3GlassStyle(variant, colors), style]}>{children}</View>;
}

// iOS Glass Style Generator
// iOS-specific style variant removed for simplicity; Material fallback is sufficient when native glass is absent.

// Material 3 Glass Style Generator
function getMaterial3GlassStyle(variant: Variant, colors: ColorScheme): ViewStyle {
  const baseStyle: ViewStyle = {
    borderRadius: 16, // Material 3 uses larger corner radius
  };

  switch (variant) {
    case 'prominent':
      return {
        ...baseStyle,
        backgroundColor: appendAlpha(colors.card, 1),
        elevation: 8, // Material 3 elevation
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: colors.cardBorder,
      };
    case 'thin':
      return {
        ...baseStyle,
        backgroundColor: appendAlpha(colors.card, 230 / 255),
        elevation: 4,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderWidth: 0.5,
        borderColor: appendAlpha(colors.cardBorder, 128 / 255),
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: appendAlpha(colors.card, 242 / 255),
        elevation: 6,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: appendAlpha(colors.cardBorder, 204 / 255),
      };
  }
}

// Expo UI Glass Effects (for Expo SDK 54+)
export function ExpoGlassContainer({
  children,
  variant = 'regular',
}: {
  children: ReactNode;
  variant?: 'regular' | 'glassProminent' | 'glass';
}) {
  const colors = useColors();

  return (
    <View
      style={[
        getMaterial3GlassStyle(variant, colors),
        {
          // Enhanced Expo SDK 54+ glass effects
          borderRadius: 16,
        },
      ]}
    >
      {children}
    </View>
  );
}
