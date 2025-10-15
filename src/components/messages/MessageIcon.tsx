/**
 * Message Icon Component
 * Displays icons for different message categories and severities
 *
 * Fully theme-aware implementation:
 * - Uses theme tokens for all colors (adapts to light/dark mode)
 * - Semantic color mapping (error, warning, info, UV levels)
 * - No hardcoded hex values
 */

import type { MessageCategory, MessageSeverity } from '@/src/types';
import type { ThemeColors } from '@/src/types/theme';
import { useColors } from '@/src/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MessageIconProps {
  category: MessageCategory;
  severity: MessageSeverity;
  size?: number;
}

/**
 * Get icon character for message category
 */
function getCategoryIcon(category: MessageCategory): string {
  switch (category) {
    case 'weather-alert':
      return '🌤️';
    case 'uv-alert':
      return '☀️';
    case 'system':
      return '⚙️';
    case 'info':
      return 'ℹ️';
    default:
      return '💬';
  }
}

/**
 * Get theme-aware background color for message category and severity
 *
 * CRITICAL: This function replaces all hardcoded Material Design colors with theme tokens.
 * All colors automatically adapt to light/dark mode via the theme system.
 *
 * Color mapping strategy:
 * - Weather alerts: Use standard severity colors (error/warning/info)
 * - UV alerts: Use UV-specific color scale (uvVeryHigh/uvHigh/uvLow)
 * - System messages: Use accent purple for brand consistency
 * - Info messages: Use info blue for informational states
 *
 * Theme tokens ensure:
 * 1. Automatic light/dark mode adaptation
 * 2. Consistent color palette across the app
 * 3. WCAG accessibility compliance
 * 4. Easy theme customization in one place (tokens.ts)
 *
 * @param category - Message category (weather-alert, uv-alert, system, info)
 * @param severity - Message severity (critical, warning, info)
 * @param colors - Theme colors object from useColors() hook
 * @returns Hex color string for the icon background
 */
function getCategoryColor(
  category: MessageCategory,
  severity: MessageSeverity,
  colors: ThemeColors
): string {
  switch (category) {
    case 'weather-alert':
      // Weather alerts use standard severity colors
      // Critical: Red (#FF453A light, #FF453A dark) - Severe weather warnings
      // Warning: Yellow (#FFD60A) - Moderate weather alerts
      // Info: Blue (#64D2FF) - General weather updates
      return severity === 'critical'
        ? colors.error      // Red for critical weather (storms, extreme temps)
        : severity === 'warning'
        ? colors.warning    // Yellow for warnings (rain, wind)
        : colors.info;      // Blue for informational alerts

    case 'uv-alert':
      // UV alerts use UV-specific color scale for consistency with UV indicator
      // Critical: Red (UV 8-10) - Dangerous UV levels, avoid sun exposure
      // Warning: Orange (UV 6-7) - High UV, protection required
      // Info: Green (UV 0-2) - Safe UV levels, minimal protection needed
      return severity === 'critical'
        ? colors.uvVeryHigh  // Red for dangerous UV (8-10)
        : severity === 'warning'
        ? colors.uvHigh      // Orange for high UV (6-7)
        : colors.uvLow;      // Green for safe UV (0-2)

    case 'system':
      // System messages use accent purple for brand consistency
      // Example: App updates, feature announcements, system maintenance
      return colors.accent;  // Purple (#5E5CE6 light, #BF5AF2 dark)

    case 'info':
      // Info messages use info blue for informational states
      // Example: Tips, tutorials, general information
      return colors.info;    // Light blue (#64D2FF)

    default:
      // Fallback to accent purple for unknown categories
      return colors.accent;
  }
}

export function MessageIcon({
  category,
  severity,
  size = 24,
}: MessageIconProps) {
  const colors = useColors();
  const icon = getCategoryIcon(category);
  const backgroundColor = getCategoryColor(category, severity, colors);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor,
          borderRadius: size / 2,
          borderColor: colors.surface,
        },
      ]}
    >
      <Text style={[styles.icon, { fontSize: size * 0.6 }]}>
        {icon}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    // borderColor set dynamically in component
  },
  icon: {
    textAlign: 'center',
  },
});

