/**
 * Message Icon Component
 * Displays icons for different message categories and severities
 */

import type { MessageCategory, MessageSeverity } from '@/src/types';
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
 * Get background color for message category
 */
function getCategoryColor(category: MessageCategory, severity: MessageSeverity): string {
  // Colors based on Material Design color palette
  switch (category) {
    case 'weather-alert':
      return severity === 'critical' ? '#B3261E' : severity === 'warning' ? '#F57C00' : '#00639D';
    case 'uv-alert':
      return severity === 'critical' ? '#FF6F00' : severity === 'warning' ? '#FFB74D' : '#4CAF50';
    case 'system':
      return '#6200EE';
    case 'info':
      return '#2196F3';
    default:
      return '#6200EE';
  }
}

export function MessageIcon({
  category,
  severity,
  size = 24,
}: MessageIconProps) {
  const icon = getCategoryIcon(category);
  const backgroundColor = getCategoryColor(category, severity);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor,
          borderRadius: size / 2,
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
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  icon: {
    textAlign: 'center',
  },
});
