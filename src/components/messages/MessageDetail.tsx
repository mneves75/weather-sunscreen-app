/**
 * Message Detail Component
 * Displays full message content with actions
 */

import React, { useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { Text, Button } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import { MessageIcon } from './MessageIcon';
import type { Message } from '@/src/types';

interface MessageDetailProps {
  message: Message;
  onClose: () => void;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get severity color
 */
function getSeverityColor(severity: string, colors: any) {
  switch (severity) {
    case 'critical':
      return colors.error;
    case 'warning':
      return colors.warning;
    case 'info':
    default:
      return colors.info;
  }
}

/**
 * Get severity text
 */
function getSeverityText(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'Critical';
    case 'warning':
      return 'Warning';
    case 'info':
    default:
      return 'Information';
  }
}

export function MessageDetail({
  message,
  onClose,
  onMarkAsRead,
  onDelete,
  onShare,
}: MessageDetailProps) {
  const colors = useColors();

  // Auto-mark as read when viewed
  useEffect(() => {
    if (!message.isRead && onMarkAsRead) {
      onMarkAsRead();
    }
  }, [message.isRead, onMarkAsRead]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const severityColor = getSeverityColor(message.severity, colors);
  const severityText = getSeverityText(message.severity);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <MessageIcon
            category={message.category}
            severity={message.severity}
            size={32}
          />
          <View style={styles.headerActions}>
            <Button
              title="Close"
              variant="ghost"
              onPress={onClose}
              style={styles.closeButton}
            />
          </View>
        </View>

        <Text
          variant="h1"
          style={[styles.title, { color: colors.onSurface }]}
        >
          {message.title}
        </Text>

        <View style={styles.meta}>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: severityColor + '20' },
            ]}
          >
            <Text
              variant="caption"
              style={[
                styles.severityText,
                { color: severityColor },
              ]}
            >
              {severityText}
            </Text>
          </View>
          <Text
            variant="caption"
            style={[styles.timestamp, { color: colors.onSurfaceVariant }]}
          >
            {formatTimestamp(message.timestamp)}
          </Text>
        </View>
      </View>

      {/* Message Content */}
      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        <Text
          variant="body1"
          style={[styles.body, { color: colors.onSurface }]}
        >
          {message.body}
        </Text>
      </View>

      {/* Data Section (if message has structured data) */}
      {message.data && Object.keys(message.data).length > 0 && (
        <View style={[styles.dataSection, { backgroundColor: colors.surface }]}>
          <Text
            variant="body2"
            style={[styles.dataTitle, { color: colors.onSurface }]}
          >
            Additional Information
          </Text>

          {message.data.uvIndex && (
            <View style={styles.dataItem}>
              <Text variant="body2" style={[styles.dataLabel, { color: colors.onSurfaceVariant }]}>
                UV Index:
              </Text>
              <Text variant="body1" style={[styles.dataValue, { color: colors.onSurface }]}>
                {message.data.uvIndex}
              </Text>
            </View>
          )}

          {message.data.temperature && (
            <View style={styles.dataItem}>
              <Text variant="body2" style={[styles.dataLabel, { color: colors.onSurfaceVariant }]}>
                Temperature:
              </Text>
              <Text variant="body1" style={[styles.dataValue, { color: colors.onSurface }]}>
                {message.data.temperature}°C
              </Text>
            </View>
          )}

          {message.data.condition && (
            <View style={styles.dataItem}>
              <Text variant="body2" style={[styles.dataLabel, { color: colors.onSurfaceVariant }]}>
                Condition:
              </Text>
              <Text variant="body1" style={[styles.dataValue, { color: colors.onSurface }]}>
                {message.data.condition}
              </Text>
            </View>
          )}

          {message.data.location && (
            <View style={styles.dataItem}>
              <Text variant="body2" style={[styles.dataLabel, { color: colors.onSurfaceVariant }]}>
                Location:
              </Text>
              <Text variant="body1" style={[styles.dataValue, { color: colors.onSurface }]}>
                {message.data.location}
              </Text>
            </View>
          )}

          {message.data.spf && (
            <View style={styles.dataItem}>
              <Text variant="body2" style={[styles.dataLabel, { color: colors.onSurfaceVariant }]}>
                Recommended SPF:
              </Text>
              <Text variant="body1" style={[styles.dataValue, { color: colors.onSurface }]}>
                SPF {message.data.spf}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {onShare && (
          <Button
            title="Share"
            variant="outline"
            onPress={onShare}
            style={styles.actionButton}
          />
        )}
        <Button
          title="Delete"
          variant="outline"
          onPress={handleDelete}
          style={[styles.actionButton, { borderColor: colors.error }]}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  closeButton: {
    minWidth: 80,
  },
  title: {
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  timestamp: {
    fontSize: 12,
  },
  content: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  body: {
    lineHeight: 24,
  },
  dataSection: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  dataTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dataLabel: {
    fontSize: 14,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
