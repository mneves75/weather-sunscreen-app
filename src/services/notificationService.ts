// Safe notification service with fallback for missing native modules
import { logger } from './loggerService';

// Safe import of expo-notifications with fallback
type NotificationAPI = {
  requestPermissionsAsync?: () => Promise<{ status: string }>;
  getPermissionsAsync?: () => Promise<{ status: string }>;
  scheduleNotificationAsync?: (opts: {
    content: { title: string; body: string; data?: unknown; sound?: boolean };
    trigger?: unknown;
  }) => Promise<string>;
  cancelScheduledNotificationAsync?: (id: string) => Promise<void>;
  cancelAllScheduledNotificationsAsync?: () => Promise<void>;
  SchedulableTriggerInputTypes?: Record<string, string>;
  setNotificationHandler?: (h: {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }) => void;
};
let Notifications: NotificationAPI | null = null;
try {
  Notifications = require('expo-notifications');
  logger.info('✅ ExpoNotifications native module loaded successfully');
} catch (error) {
  logger.warn('⚠️ ExpoNotifications native module not available', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  logger.info('📢 Using fallback notification service for development');
}

export class NotificationService {
  static async isAvailable(): Promise<boolean> {
    return Notifications !== null;
  }

  static async requestPermissions(): Promise<boolean> {
    if (!Notifications) {
      logger.info('📢 Notification permissions: native module not available');
      return false;
    }

    try {
      const status = await Notifications.requestPermissionsAsync?.();
      if (!status) return false;
      return status.status === 'granted';
    } catch (error) {
      logger.warn('Failed to request notification permissions', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  static async scheduleNotification(
    title: string,
    body: string,
    trigger: unknown,
  ): Promise<string | null> {
    if (!Notifications) {
      logger.info('📢 Schedule notification: native module not available');
      return null;
    }

    try {
      const identifier = await Notifications.scheduleNotificationAsync?.({
        content: { title, body },
        trigger,
      });
      if (!identifier) return null;
      return identifier;
    } catch (error) {
      logger.error(
        'Failed to schedule notification',
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  static async scheduleAt(
    date: Date,
    content: { title: string; body: string; data?: unknown; sound?: boolean },
  ): Promise<string | null> {
    if (!Notifications) {
      logger.info('📢 Schedule at date: native module not available');
      return null;
    }

    try {
      const type = Notifications.SchedulableTriggerInputTypes?.DATE ?? 'date';
      const identifier = await Notifications.scheduleNotificationAsync?.({
        content: {
          title: content.title,
          body: content.body,
          data: content.data,
          sound: content.sound ?? false,
        },
        trigger: { type, date },
      });
      if (!identifier) return null;
      return identifier as string;
    } catch (error) {
      logger.error(
        'Failed to schedule date notification',
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  static async cancelNotification(identifier: string): Promise<void> {
    if (!Notifications) {
      logger.info('📢 Cancel notification: native module not available');
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync?.(identifier);
    } catch (error) {
      logger.error(
        'Failed to cancel notification',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  static async cancelAll(): Promise<void> {
    if (!Notifications) {
      logger.info('📢 Cancel all notifications: native module not available');
      return;
    }
    try {
      await Notifications.cancelAllScheduledNotificationsAsync?.();
    } catch (error) {
      logger.error(
        'Failed to cancel all notifications',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}

// Set default notification handler if available
if (Notifications?.setNotificationHandler) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    logger.warn('Failed to set notification handler', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
