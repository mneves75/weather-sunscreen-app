/**
 * Messages Context
 * Manages messages state, notifications, and alert evaluation
 */

import { alertRuleEngine, messageService, notificationService } from '@/src/services';
import { logger } from '@/src/services/LoggerService';
import type {
    Message,
    MessageCategory,
    MessageFilter,
    MessageInput,
    MessageStats,
    NotificationPermission,
    NotificationResponse,
} from '@/src/types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Messages context value interface
 */
interface MessagesContextValue {
  // State
  messages: Message[];
  unreadCount: number;
  stats: MessageStats | null;
  isLoading: boolean;
  error: Error | null;
  
  // Notification state
  notificationPermission: NotificationPermission | null;
  
  // Operations
  refreshMessages: () => Promise<void>;
  createMessage: (input: MessageInput) => Promise<Message>;
  markAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: (category?: MessageCategory) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  deleteMessages: (ids: string[]) => Promise<void>;
  clearAllMessages: (category?: MessageCategory) => Promise<void>;
  
  // Filtering
  filterMessages: (filter: MessageFilter) => Message[];
  
  // Notifications
  requestNotificationPermission: () => Promise<void>;
  registerForNotifications: () => Promise<void>;
  
  // Alert evaluation
  evaluateWeatherAlerts: () => Promise<void>;
}

const MessagesContext = createContext<MessagesContextValue | undefined>(undefined);

interface MessagesProviderProps {
  children: React.ReactNode;
}

/**
 * Messages Provider
 * Manages messages state and integrates with services
 */
export function MessagesProvider({ children }: MessagesProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize services and load data
   */
  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        logger.info('Initializing MessagesContext', 'MESSAGES');

        // Initialize services
        await messageService.initialize();
        await notificationService.initialize();
        await alertRuleEngine.initialize();

        // Load initial data
        await loadMessages();
        await loadStats();
        await loadPermissionStatus();

        setIsInitialized(true);
        logger.info('MessagesContext initialized', 'MESSAGES');
      } catch (err) {
        logger.error('Failed to initialize MessagesContext', err as Error, 'MESSAGES');
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  /**
   * Set up notification handlers
   */
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    logger.info('Setting up notification handlers', 'MESSAGES');

    // Handle notification received while app is in foreground
    const unsubscribeReceived = notificationService.onNotificationReceived((notification) => {
      logger.info('Notification received in foreground', 'MESSAGES', {
        title: notification.request.content.title,
      });
      
      // Refresh messages to show new notification
      loadMessages();
    });

    // Handle notification response (user tapped notification)
    const unsubscribeResponse = notificationService.onNotificationResponse((response: NotificationResponse) => {
      logger.info('Notification tapped', 'MESSAGES', {
        id: response.notification.identifier,
        action: response.actionIdentifier,
      });

      // Mark the related message as read
      const messageId = response.notification.request.content.data?.messageId as string;
      if (messageId) {
        markAsRead([messageId]);
      }

      // TODO: Navigate to appropriate screen based on notification data
    });

    return () => {
      unsubscribeReceived();
      unsubscribeResponse();
    };
  }, [isInitialized]);

  /**
   * Sync badge count with unread count
   */
  useEffect(() => {
    if (isInitialized) {
      notificationService.setBadgeCount(unreadCount);
    }
  }, [unreadCount, isInitialized]);

  /**
   * Handle app state changes (foreground/background)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground, refresh data
      logger.info('App became active, refreshing messages', 'MESSAGES');
      loadMessages();
      loadStats();
    }
  }, []);

  /**
   * Load messages from service
   */
  const loadMessages = useCallback(async () => {
    try {
      const loadedMessages = await messageService.getMessages();
      setMessages(loadedMessages);
      
      const count = await messageService.getUnreadCount();
      setUnreadCount(count);
      
      logger.info(`Loaded ${loadedMessages.length} messages (${count} unread)`, 'MESSAGES');
    } catch (err) {
      logger.error('Failed to load messages', err as Error, 'MESSAGES');
      setError(err as Error);
    }
  }, []);

  /**
   * Load statistics
   */
  const loadStats = useCallback(async () => {
    try {
      const messageStats = await messageService.getStats();
      setStats(messageStats);
    } catch (err) {
      logger.error('Failed to load stats', err as Error, 'MESSAGES');
    }
  }, []);

  /**
   * Load notification permission status
   */
  const loadPermissionStatus = useCallback(async () => {
    try {
      const permission = await notificationService.getPermissionStatus();
      setNotificationPermission(permission);
    } catch (err) {
      logger.error('Failed to load permission status', err as Error, 'MESSAGES');
    }
  }, []);

  /**
   * Refresh all messages
   */
  const refreshMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await loadMessages();
      await loadStats();
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [loadMessages, loadStats]);

  /**
   * Create a new message
   */
  const createMessage = useCallback(async (input: MessageInput): Promise<Message> => {
    try {
      const message = await messageService.createMessage(input);
      
      // Refresh messages list
      await loadMessages();
      await loadStats();
      
      logger.info('Message created via context', 'MESSAGES', { id: message.id });
      return message;
    } catch (err) {
      logger.error('Failed to create message', err as Error, 'MESSAGES');
      throw err;
    }
  }, [loadMessages, loadStats]);

  /**
   * Mark messages as read
   */
  const markAsRead = useCallback(async (ids: string[]) => {
    try {
      await messageService.markAsRead(ids);
      await loadMessages();
      await loadStats();
      
      logger.info(`Marked ${ids.length} messages as read`, 'MESSAGES');
    } catch (err) {
      logger.error('Failed to mark messages as read', err as Error, 'MESSAGES');
      setError(err as Error);
    }
  }, [loadMessages, loadStats]);

  /**
   * Mark all messages as read
   */
  const markAllAsRead = useCallback(async (category?: MessageCategory) => {
    try {
      const count = await messageService.markAllAsRead(category);
      await loadMessages();
      await loadStats();
      
      logger.info(`Marked ${count} messages as read${category ? ` (${category})` : ''}`, 'MESSAGES');
    } catch (err) {
      logger.error('Failed to mark all as read', err as Error, 'MESSAGES');
      setError(err as Error);
    }
  }, [loadMessages, loadStats]);

  /**
   * Delete a message
   */
  const deleteMessage = useCallback(async (id: string) => {
    try {
      await messageService.deleteMessage(id);
      await loadMessages();
      await loadStats();
      
      logger.info('Message deleted via context', 'MESSAGES', { id });
    } catch (err) {
      logger.error('Failed to delete message', err as Error, 'MESSAGES');
      setError(err as Error);
    }
  }, [loadMessages, loadStats]);

  /**
   * Delete multiple messages
   */
  const deleteMessages = useCallback(async (ids: string[]) => {
    try {
      await messageService.deleteMessages(ids);
      await loadMessages();
      await loadStats();
      
      logger.info(`Deleted ${ids.length} messages`, 'MESSAGES');
    } catch (err) {
      logger.error('Failed to delete messages', err as Error, 'MESSAGES');
      setError(err as Error);
    }
  }, [loadMessages, loadStats]);

  /**
   * Clear all messages
   */
  const clearAllMessages = useCallback(async (category?: MessageCategory) => {
    try {
      const count = await messageService.deleteAllMessages(category);
      await loadMessages();
      await loadStats();
      
      logger.info(`Cleared ${count} messages${category ? ` (${category})` : ''}`, 'MESSAGES');
    } catch (err) {
      logger.error('Failed to clear messages', err as Error, 'MESSAGES');
      setError(err as Error);
    }
  }, [loadMessages, loadStats]);

  /**
   * Filter messages
   */
  const filterMessages = useCallback((filter: MessageFilter): Message[] => {
    return messages.filter(message => {
      // Filter by categories
      if (filter.categories && filter.categories.length > 0) {
        if (!filter.categories.includes(message.category)) {
          return false;
        }
      }

      // Filter by severity
      if (filter.severity && filter.severity.length > 0) {
        if (!filter.severity.includes(message.severity)) {
          return false;
        }
      }

      // Filter by read status
      if (filter.isRead !== undefined) {
        if (message.isRead !== filter.isRead) {
          return false;
        }
      }

      // Filter by date range
      if (filter.dateRange) {
        if (message.timestamp < filter.dateRange.start || message.timestamp > filter.dateRange.end) {
          return false;
        }
      }

      // Filter by search term
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        if (!message.title.toLowerCase().includes(searchLower) &&
            !message.body.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [messages]);

  /**
   * Request notification permission
   */
  const requestNotificationPermission = useCallback(async () => {
    try {
      logger.info('Requesting notification permission via context', 'MESSAGES');
      const permission = await notificationService.requestPermissions();
      setNotificationPermission(permission);
      
      if (permission.status === 'granted') {
        // Auto-register for push notifications
        await registerForNotifications();
      }
    } catch (err) {
      logger.error('Failed to request permission', err as Error, 'MESSAGES');
      setError(err as Error);
    }
  }, []);

  /**
   * Register for push notifications
   */
  const registerForNotifications = useCallback(async () => {
    try {
      logger.info('Registering for push notifications via context', 'MESSAGES');
      const token = await notificationService.registerForPushNotifications();
      
      if (token) {
        logger.info('Successfully registered for push notifications', 'MESSAGES', {
          platform: token.platform,
        });
      }
    } catch (err) {
      logger.error('Failed to register for notifications', err as Error, 'MESSAGES');
      setError(err as Error);
    }
  }, []);

  /**
   * Evaluate weather alerts based on current data
   * This should be called when weather/UV data updates
   */
  const evaluateWeatherAlerts = useCallback(async () => {
    try {
      logger.info('Evaluating weather alerts', 'MESSAGES');
      
      // This will be called from WeatherContext when data updates
      // For now, it's a placeholder that components can call manually
      
      logger.info('Weather alert evaluation complete', 'MESSAGES');
    } catch (err) {
      logger.error('Failed to evaluate weather alerts', err as Error, 'MESSAGES');
    }
  }, []);

  /**
   * Memoized context value
   */
  const value = useMemo<MessagesContextValue>(() => ({
    // State
    messages,
    unreadCount,
    stats,
    isLoading,
    error,
    notificationPermission,
    
    // Operations
    refreshMessages,
    createMessage,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    deleteMessages,
    clearAllMessages,
    
    // Filtering
    filterMessages,
    
    // Notifications
    requestNotificationPermission,
    registerForNotifications,
    
    // Alert evaluation
    evaluateWeatherAlerts,
  }), [
    messages,
    unreadCount,
    stats,
    isLoading,
    error,
    notificationPermission,
    refreshMessages,
    createMessage,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    deleteMessages,
    clearAllMessages,
    filterMessages,
    requestNotificationPermission,
    registerForNotifications,
    evaluateWeatherAlerts,
  ]);

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

/**
 * Hook to access messages context
 */
export function useMessages(): MessagesContextValue {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}

