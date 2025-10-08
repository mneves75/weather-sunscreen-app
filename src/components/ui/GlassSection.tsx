/**
 * GlassSection Component
 * Section container with title and glass/solid variants
 * 
 * Features:
 * - Section title with consistent typography
 * - Liquid Glass container (iOS 26+)
 * - Material Design elevation fallback
 * - Accessibility group role
 * - Customizable spacing and styling
 */

import { Text } from './Text';
import { useColors, useGlassAvailability } from '@/src/theme';
import { GlassStyle, GlassView } from 'expo-glass-effect';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

export interface GlassSectionProps extends ViewProps {
  /**
   * Section title (displayed at the top)
   */
  title: string;
  
  /**
   * Section content
   */
  children: React.ReactNode;
  
  /**
   * Border radius for the section (default: 20)
   */
  borderRadius?: number;
  
  /**
   * Padding inside the section (default: 20)
   */
  padding?: number;
  
  /**
   * Vertical margin for the section (default: 8)
   */
  marginVertical?: number;
  
  /**
   * Custom style override for the section wrapper
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the content area
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
   * Accessibility label for the section (defaults to title)
   */
  accessibilityLabel?: string;
  
  /**
   * Hide the title (useful when using custom header)
   */
  hideTitle?: boolean;
}

/**
 * GlassSection - Section container with title and glass/solid variants
 * 
 * @example
 * ```tsx
 * <GlassSection 
 *   title="Appearance Settings"
 *   accessibilityLabel="Appearance settings section"
 * >
 *   <SettingItem title="Theme" subtitle="Dark" />
 *   <SettingItem title="High Contrast" />
 * </GlassSection>
 * ```
 */
export const GlassSection = React.memo<GlassSectionProps>(({
  title,
  children,
  borderRadius = 20,
  padding = 20,
  marginVertical = 8,
  style,
  contentStyle,
  tintColor,
  glassEffectStyle = 'regular',
  accessibilityLabel,
  hideTitle = false,
  ...viewProps
}) => {
  const colors = useColors();
  const { canUseGlass } = useGlassAvailability();
  
  const defaultTintColor = tintColor || colors.surfaceTint;
  const label = accessibilityLabel || title;
  
  // Section content (title + children)
  const content = (
    <View style={[styles.content, { padding }, contentStyle]}>
      {!hideTitle && (
        <Text variant="h3" style={[styles.title, { color: colors.onSurface }]}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
  
  // Glass variant (iOS 26+)
  if (canUseGlass) {
    return (
      <GlassView 
        style={[
          styles.glassSection,
          { 
            borderRadius,
            marginVertical,
          },
          style,
        ]}
        glassEffectStyle={glassEffectStyle}
        tintColor={defaultTintColor}
        accessibilityLabel={label}
        {...viewProps}
      >
        {content}
      </GlassView>
    );
  }
  
  // Solid Material Design variant (Android, iOS < 26, accessibility)
  return (
    <View 
      style={[
        styles.solidSection,
        { 
          backgroundColor: colors.surface,
          borderRadius,
          marginVertical,
        },
        style,
      ]}
      accessibilityLabel={label}
      {...viewProps}
    >
      {content}
    </View>
  );
});

GlassSection.displayName = 'GlassSection';

const styles = StyleSheet.create({
  // Glass section (iOS 26+)
  glassSection: {
    overflow: 'hidden',
  },
  // Solid section (Android, iOS < 26, accessibility)
  solidSection: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    // Padding applied dynamically via props
  },
  title: {
    marginBottom: 16,
  },
});

