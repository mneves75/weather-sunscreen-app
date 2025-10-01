/**
 * Message Card Component
 * Displays a message preview with category icon, title, body snippet
 */

import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import type { Message } from '@/src/types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MessageIcon } from './MessageIcon';

interface MessageCardProps {
  message: Message;
  onPress: (message: Message) => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

/**
 * Get relative time string for message timestamp
 */
function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }
}

/**
 * Truncate text to specified length
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

export function MessageCard({
  message,
  onPress,
  onMarkAsRead,
  onDelete,
  showActions = false,
}: MessageCardProps) {
  const colors = useColors();

  const handlePress = () => {
    onPress(message);
  };

  const handleMarkAsRead = (e: any) => {
    e.stopPropagation();
    onMarkAsRead?.(message.id);
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    onDelete?.(message.id);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'weather-alert':
        return colors.error;
      case 'uv-alert':
        return colors.warning;
      case 'system':
        return colors.info;
      case 'info':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  const categoryColor = getCategoryColor(message.category);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        !message.isRead && { backgroundColor: colors.surfaceVariant },
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Message: ${message.title}. ${message.body}`}
      accessibilityHint="Tap to view full message"
    >
      <View style={styles.content}>
        {/* Header with icon and timestamp */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MessageIcon
              category={message.category}
              severity={message.severity}
              size={20}
            />
            {!message.isRead && (
              <View
                style={[styles.unreadDot, { backgroundColor: categoryColor }]}
                accessibilityLabel="Unread message"
              />
            )}
          </View>
          <Text
            variant="caption"
            style={[styles.timestamp, { color: colors.onSurfaceVariant }]}
          >
            {getRelativeTime(message.timestamp)}
          </Text>
        </View>

        {/* Message content */}
        <View style={styles.messageContent}>
          <Text
            variant="body1"
            style={[
              styles.title,
              { color: colors.onSurface },
              !message.isRead && { fontWeight: '600' },
            ]}
            numberOfLines={2}
          >
            {message.title}
          </Text>
          <Text
            variant="body2"
            style={[styles.body, { color: colors.onSurfaceVariant }]}
            numberOfLines={2}
          >
            {truncateText(message.body, 120)}
          </Text>
        </View>

        {/* Category badge */}
        <View style={styles.footer}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: categoryColor + '20' }, // 20% opacity
            ]}
          >
            <Text
              variant="caption"
              style={[
                styles.categoryText,
                { color: categoryColor },
              ]}
            >
              {message.category.replace('-', ' ')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  messageContent: {
    marginBottom: 12,
  },
  title: {
    marginBottom: 4,
    lineHeight: 20,
  },
  body: {
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

