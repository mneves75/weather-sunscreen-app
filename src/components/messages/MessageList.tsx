/**
 * Message List Component
 * Displays a list of messages with filtering, sorting, and actions
 * Uses FlashList for optimized rendering performance
 */

import { FlashList } from '@shopify/flash-list';
import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import type { Message } from '@/src/types';
import React, { useCallback, useMemo } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native';
import { MessageCard } from './MessageCard';

interface MessageListProps {
  messages: Message[];
  onMessagePress: (message: Message) => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  emptyDescription?: string;
}

/**
 * Get section header title for date grouping
 */
function getSectionHeaderTitle(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return 'This Week';
  } else {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }
}

/**
 * Group messages by date for section headers
 */
function groupMessagesByDate(messages: Message[]): Array<{
  title: string;
  data: Message[];
}> {
  const groups: { [key: string]: Message[] } = {};

  messages.forEach(message => {
    const sectionTitle = getSectionHeaderTitle(message.timestamp);
    if (!groups[sectionTitle]) {
      groups[sectionTitle] = [];
    }
    groups[sectionTitle].push(message);
  });

  return Object.entries(groups).map(([title, data]) => ({
    title,
    data: data.sort((a, b) => b.timestamp - a.timestamp), // Newest first within section
  }));
}

export function MessageList({
  messages,
  onMessagePress,
  onMarkAsRead,
  onDelete,
  onRefresh,
  isLoading = false,
  error = null,
  emptyMessage = 'No messages yet',
  emptyDescription = "You'll receive weather and UV alerts here",
}: MessageListProps) {
  const colors = useColors();

  // Group messages by date
  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

  // Render message item
  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageCard
        message={item}
        onPress={onMessagePress}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
    ),
    [onMessagePress, onMarkAsRead, onDelete]
  );

  // Render section header
  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; data: Message[] } }) => (
      <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
        <Text variant="body2" style={[styles.sectionTitle, { color: colors.onBackground }]}>
          {section.title}
        </Text>
      </View>
    ),
    [colors]
  );

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="body2" style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
            Loading messages...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text variant="body1" style={[styles.errorText, { color: colors.error }]}>
            Unable to load messages
          </Text>
          <Text variant="body2" style={[styles.errorDescription, { color: colors.onSurfaceVariant }]}>
            {error.message}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text variant="h2" style={[styles.emptyEmoji, { color: colors.primary }]}>
          💬
        </Text>
        <Text variant="body1" style={[styles.emptyTitle, { color: colors.onSurface }]}>
          {emptyMessage}
        </Text>
        <Text variant="body2" style={[styles.emptyDescription, { color: colors.onSurfaceVariant }]}>
          {emptyDescription}
        </Text>
      </View>
    );
  }, [isLoading, error, emptyMessage, emptyDescription, colors]);

  // Render refresh control
  const renderRefreshControl = useCallback(() => {
    if (!onRefresh) return undefined;

    return (
      <RefreshControl
        refreshing={isLoading}
        onRefresh={onRefresh}
        tintColor={colors.primary}
        colors={[colors.primary]}
      />
    );
  }, [isLoading, onRefresh, colors]);

  if (error && messages.length === 0) {
    return renderEmpty();
  }

  return (
    <FlashList
      data={groupedMessages}
      renderItem={({ item: section }) => (
        <View>
          {renderSectionHeader({ section })}
          {section.data.map(message => (
            <View key={message.id}>
              {renderItem({ item: message })}
            </View>
          ))}
        </View>
      )}
      keyExtractor={(section) => section.title}
      estimatedItemSize={120}
      refreshControl={renderRefreshControl()}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        messages.length === 0 && styles.emptyListContainer,
      ]}
      estimatedListSize={{ height: 600, width: 400 }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
