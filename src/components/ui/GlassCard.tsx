/**
 * GlassCard Component
 * Universal card wrapper with glass/solid variants
 * 
 * Features:
 * - Liquid Glass effect (iOS 26+) with UIVisualEffectView
 * - Material Design elevation fallback (Android, iOS < 26, accessibility)
 * - Customizable border radius, padding, and spacing
 * - Accessibility-friendly with proper roles and labels
 * - Style prop override support for flexibility
 */

import { useColors, useGlassAvailability } from '@/src/theme';
import { GlassStyle, GlassView } from 'expo-glass-effect';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

export interface GlassCardProps extends ViewProps {
  /**
   * Content to render inside the card
   */
  children: React.ReactNode;
  
  /**
   * Border radius for the card (default: 20)
   */
  borderRadius?: number;
  
  /**
   * Padding inside the card (default: undefined, handled by content)
   */
  padding?: number;
  
  /**
   * Vertical margin for the card (default: 8)
   */
  marginVertical?: number;
  
  /**
   * Custom style override for the card wrapper
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the content wrapper (inside glass/solid view)
   */
  contentStyle?: StyleProp<ViewStyle>;
  
  /**
   * Tint color for glass effect (defaults to theme surfaceTint)
   */
  tintColor?: string;
  
  /**
   * Glass effect style variant (default: 'regular')
   */
  glassEffectStyle?: GlassStyle;
  
  /**
   * Accessibility label for the card
   */
  accessibilityLabel?: string;
}

/**
 * GlassCard - Universal card component with glass/solid variants
 * 
 * @example
 * ```tsx
 * <GlassCard 
 *   borderRadius={24}
 *   padding={20}
 *   accessibilityRole="button"
 *   accessibilityLabel="Weather forecast card"
 * >
 *   <Text>Card content</Text>
 * </GlassCard>
 * ```
 */
export const GlassCard = React.memo<GlassCardProps>(({ 
  children,
  borderRadius = 20,
  padding,
  marginVertical = 8,
  style,
  contentStyle,
  tintColor,
  glassEffectStyle = 'regular',
  accessibilityLabel,
  ...viewProps
}) => {
  const colors = useColors();
  const { canUseGlass } = useGlassAvailability();
  
  const defaultTintColor = tintColor ?? colors.surfaceTint;
  
  // Glass variant (iOS 26+)
  if (canUseGlass) {
    return (
      <GlassView 
        style={[
          styles.glassCard,
          { 
            borderRadius,
            marginVertical,
          },
          style,
        ]}
        glassEffectStyle={glassEffectStyle}
        tintColor={defaultTintColor}
        accessibilityLabel={accessibilityLabel}
        {...viewProps}
      >
        <View style={[padding !== undefined && { padding }, contentStyle]}>
          {children}
        </View>
      </GlassView>
    );
  }
  
  // Solid Material Design variant (Android, iOS < 26, accessibility)
  return (
    <View 
      style={[
        styles.solidCard,
        { 
          backgroundColor: colors.surface,
          borderRadius,
          marginVertical,
        },
        padding !== undefined && { padding },
        style,
        contentStyle,
      ]}
      accessibilityLabel={accessibilityLabel}
      {...viewProps}
    >
      {children}
    </View>
  );
});

GlassCard.displayName = 'GlassCard';

const styles = StyleSheet.create({
  // Glass card (iOS 26+)
  glassCard: {
    overflow: 'hidden',
  },
  // Solid card (Android, iOS < 26, accessibility)
  solidCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

