/**
 * Message Detail Screen
 * Displays full message content with actions and auto-mark as read
 */

import { MessageDetail } from '@/src/components/messages/MessageDetail';
import { useMessages } from '@/src/context/MessagesContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Share } from 'react-native';

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();

  const {
    messages,
    markAsRead,
    deleteMessage,
  } = useMessages();

  // Find the message by ID
  const message = useMemo(() => {
    return messages.find(m => m.id === id);
  }, [messages, id]);

  // Handle close
  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // Handle mark as read (called when message is viewed)
  const handleMarkAsRead = useCallback(async () => {
    if (message && !message.isRead) {
      await markAsRead([message.id]);
    }
  }, [message, markAsRead]);

  // Handle delete message
  const handleDelete = useCallback(async () => {
    if (message) {
      await deleteMessage(message.id);
      router.back();
    }
  }, [message, deleteMessage, router]);

  // Handle share message
  const handleShare = useCallback(async () => {
    if (message) {
      try {
        await Share.share({
          title: message.title,
          message: `${message.title}\n\n${message.body}`,
        });
      } catch (error) {
        // Share cancelled or failed - silently ignore
      }
    }
  }, [message]);

  // If message not found, show error or redirect
  if (!message) {
    return (
      <MessageDetail
        message={{
          id: 'error',
          category: 'system',
          severity: 'info',
          title: t('messages.detail.notFound', 'Message Not Found'),
          body: t('messages.detail.notFoundDescription', 'The requested message could not be found.'),
          timestamp: Date.now(),
          isRead: true,
        }}
        onClose={handleClose}
      />
    );
  }

  return (
    <MessageDetail
      message={message}
      onClose={handleClose}
      onMarkAsRead={handleMarkAsRead}
      onDelete={handleDelete}
      onShare={handleShare}
    />
  );
}
