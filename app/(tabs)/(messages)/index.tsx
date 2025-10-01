/**
 * Messages Screen
 * Full-featured message center with filtering, sorting, and actions
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, Button, TouchableOpacity } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import { useMessages } from '@/src/context/MessagesContext';
import { useSettings } from '@/src/context/SettingsContext';
import { MessageList } from '@/src/components/messages/MessageList';
import { MessageFilters } from '@/src/components/messages/MessageFilters';
import { NotificationBadge } from '@/src/components/messages/NotificationBadge';
import type { Message, MessageFilter } from '@/src/types';

export default function MessagesScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();

  // Context
  const {
    messages,
    unreadCount,
    stats,
    isLoading,
    error,
    refreshMessages,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    deleteMessages,
    clearAllMessages,
    requestNotificationPermission,
    registerForNotifications,
  } = useMessages();

  const { preferences } = useSettings();

  // Local state
  const [activeFilter, setActiveFilter] = useState<MessageFilter>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter messages based on active filter
  const filteredMessages = useMemo(() => {
    if (!activeFilter || Object.keys(activeFilter).length === 0) {
      return messages;
    }

    return messages.filter(message => {
      // Filter by categories
      if (activeFilter.categories && activeFilter.categories.length > 0) {
        if (!activeFilter.categories.includes(message.category)) {
          return false;
        }
      }

      // Filter by severity
      if (activeFilter.severity && activeFilter.severity.length > 0) {
        if (!activeFilter.severity.includes(message.severity)) {
          return false;
        }
      }

      // Filter by read status
      if (activeFilter.isRead !== undefined) {
        if (message.isRead !== activeFilter.isRead) {
          return false;
        }
      }

      // Filter by date range
      if (activeFilter.dateRange) {
        if (message.timestamp < activeFilter.dateRange.start ||
            message.timestamp > activeFilter.dateRange.end) {
          return false;
        }
      }

      // Filter by search term
      if (activeFilter.searchTerm) {
        const searchLower = activeFilter.searchTerm.toLowerCase();
        if (!message.title.toLowerCase().includes(searchLower) &&
            !message.body.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [messages, activeFilter]);

  // Handle message press
  const handleMessagePress = useCallback((message: Message) => {
    router.push(`/(tabs)/(messages)/detail?id=${message.id}`);
  }, [router]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refreshMessages();
  }, [refreshMessages]);

  // Handle mark as read
  const handleMarkAsRead = useCallback(async (id: string) => {
    await markAsRead([id]);
  }, [markAsRead]);

  // Handle delete message
  const handleDeleteMessage = useCallback(async (id: string) => {
    await deleteMessage(id);
  }, [deleteMessage]);

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead(activeFilter.categories?.[0]);
  }, [markAllAsRead, activeFilter.categories]);

  // Handle delete all messages
  const handleDeleteAll = useCallback(async () => {
    const category = activeFilter.categories?.[0];
    await clearAllMessages(category);
  }, [clearAllMessages, activeFilter.categories]);

  // Handle share message
  const handleShareMessage = useCallback(async (message: Message) => {
    try {
      await Share.share({
        title: message.title,
        message: `${message.title}\n\n${message.body}`,
      });
    } catch (error) {
      // Share cancelled or failed
    }
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((filter: MessageFilter) => {
    setActiveFilter(filter);
  }, []);

  // Handle selection mode toggle
  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds([]);
  }, [isSelectionMode]);

  // Handle message selection
  const handleMessageSelection = useCallback((messageId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  }, []);

  // Handle batch mark as read
  const handleBatchMarkAsRead = useCallback(async () => {
    await markAsRead(selectedIds);
    setSelectedIds([]);
    setIsSelectionMode(false);
  }, [markAsRead, selectedIds]);

  // Handle batch delete
  const handleBatchDelete = useCallback(async () => {
    Alert.alert(
      'Delete Messages',
      `Are you sure you want to delete ${selectedIds.length} message(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMessages(selectedIds) },
      ]
    );
    setSelectedIds([]);
    setIsSelectionMode(false);
  }, [selectedIds, deleteMessages]);

  // Handle notification setup
  const handleSetupNotifications = useCallback(async () => {
    try {
      await requestNotificationPermission();
      await registerForNotifications();
    } catch (error) {
      Alert.alert(
        'Notification Setup Failed',
        'Unable to enable notifications. Please check your device settings.'
      );
    }
  }, [requestNotificationPermission, registerForNotifications]);

  // Show notification setup prompt if needed
  useEffect(() => {
    if (preferences.notificationsEnabled && !preferences.uvAlerts && !preferences.weatherAlerts) {
      // Show prompt to set up notifications if user has enabled them but hasn't configured alerts
      // This would be shown once per session
    }
  }, [preferences]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerTop}>
          <Text variant="h1" style={[styles.title, { color: colors.onSurface }]}>
            {t('messages.title', 'Messages')}
          </Text>
          <View style={styles.headerActions}>
            {/* Filter toggle */}
            <TouchableOpacity
              style={[styles.headerButton, { borderColor: colors.outline }]}
              onPress={() => setShowFilters(!showFilters)}
              accessibilityRole="button"
              accessibilityLabel={showFilters ? 'Hide filters' : 'Show filters'}
            >
              <Text variant="body2" style={[styles.headerButtonText, { color: colors.onSurfaceVariant }]}>
                {showFilters ? 'Hide Filters' : 'Filters'}
          </Text>
            </TouchableOpacity>

            {/* Selection mode toggle */}
            {!isSelectionMode && (
              <TouchableOpacity
                style={[styles.headerButton, { borderColor: colors.outline }]}
                onPress={handleToggleSelectionMode}
                accessibilityRole="button"
                accessibilityLabel="Select messages"
              >
                <Text variant="body2" style={[styles.headerButtonText, { color: colors.onSurfaceVariant }]}>
                  Select
          </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Unread count and stats */}
        <View style={styles.stats}>
          <Text variant="body2" style={[styles.statText, { color: colors.onSurfaceVariant }]}>
            {unreadCount} unread • {filteredMessages.length} total
          </Text>
        </View>
      </View>

      {/* Filters */}
      {showFilters && stats && (
        <MessageFilters
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          stats={stats}
        />
      )}

      {/* Selection mode toolbar */}
      {isSelectionMode && (
        <View style={[styles.selectionToolbar, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={handleToggleSelectionMode}>
            <Text variant="body2" style={[styles.selectionText, { color: colors.onPrimary }]}>
              Cancel
        </Text>
          </TouchableOpacity>

          {selectedIds.length > 0 && (
            <>
              <Text variant="body2" style={[styles.selectionText, { color: colors.onPrimary }]}>
                {selectedIds.length} selected
              </Text>

              <TouchableOpacity onPress={handleBatchMarkAsRead}>
                <Text variant="body2" style={[styles.selectionText, { color: colors.onPrimary }]}>
                  Mark Read
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleBatchDelete}>
                <Text variant="body2" style={[styles.selectionText, { color: colors.onPrimary }]}>
                  Delete
              </Text>
              </TouchableOpacity>
            </>
          )}
            </View>
      )}

      {/* Quick actions (when not in selection mode) */}
      {!isSelectionMode && (
        <View style={styles.quickActions}>
          {unreadCount > 0 && (
            <Button
              title={`Mark All Read (${unreadCount})`}
              variant="outline"
              size="small"
              onPress={handleMarkAllAsRead}
              style={styles.quickActionButton}
            />
          )}

          <Button
            title="Setup Notifications"
            variant="outline"
            size="small"
            onPress={handleSetupNotifications}
            style={styles.quickActionButton}
            />
          </View>
      )}

      {/* Message list */}
      <MessageList
        messages={filteredMessages}
        onMessagePress={handleMessagePress}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDeleteMessage}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        error={error}
        emptyMessage={t('messages.empty', 'No messages yet')}
        emptyDescription={t('messages.emptyDescription', "You'll receive weather and UV alerts here")}
      />

      {/* Permission prompt for notifications */}
      {preferences.notificationsEnabled && !preferences.uvAlerts && !preferences.weatherAlerts && (
        <View style={[styles.permissionPrompt, { backgroundColor: colors.infoContainer }]}>
          <Text variant="body2" style={[styles.permissionText, { color: colors.onInfoContainer }]}>
            {t('messages.notifications.permissionMessage', 'Enable alerts to receive weather and UV notifications')}
              </Text>
          <Button
            title={t('messages.notifications.enableAlerts', 'Enable Alerts')}
            variant="ghost"
            size="small"
            onPress={handleSetupNotifications}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  headerButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
  },
  selectionToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
  },
  permissionPrompt: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionText: {
    flex: 1,
    marginRight: 12,
  },
});

