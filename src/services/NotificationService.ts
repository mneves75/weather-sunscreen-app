/**
 * Notification Service
 * Handles push notifications, local notifications, and permissions
 */

import type {
    AnyNotificationTrigger,
    DailyTrigger,
    DateTrigger,
    IntervalTrigger,
    NotificationPayload,
    NotificationPermission,
    NotificationResponse,
    NotificationServiceConfig,
    NotificationToken,
    ScheduledNotification,
} from '@/src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logger } from './LoggerService';

const NOTIFICATION_TOKEN_KEY = '@WeatherSunscreen:notificationToken';
const NOTIFICATION_PERMISSION_KEY = '@WeatherSunscreen:notificationPermission';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const DEFAULT_CONFIG: NotificationServiceConfig = {
  enablePush: true,
  enableLocal: true,
  soundEnabled: true,
  badgeEnabled: true,
  autoRegister: false, // Manual registration for better UX
};

/**
 * Notification Service singleton
 * Manages notifications, permissions, and tokens
 */
class NotificationService {
  private static instance: NotificationService;
  private config: NotificationServiceConfig = DEFAULT_CONFIG;
  private isInitialized = false;
  private notificationListeners: {
    received?: Notifications.Subscription;
    response?: Notifications.Subscription;
  } = {};

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification service
   */
  public async initialize(config?: Partial<NotificationServiceConfig>): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const startTime = Date.now();
      logger.info('Initializing NotificationService', 'NOTIFICATIONS');

      // Merge config
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Set up notification channels (Android)
      if (Platform.OS === 'android') {
        const channelStart = Date.now();
        logger.info('Setting up Android notification channels...', 'NOTIFICATIONS');
        await this.setupAndroidChannels();
        logger.info(`Android channels configured in ${Date.now() - channelStart}ms`, 'NOTIFICATIONS');
      }

      // Auto-register if enabled
      if (this.config.autoRegister) {
        const registerStart = Date.now();
        logger.info('Auto-registering for push notifications...', 'NOTIFICATIONS');
        await this.registerForPushNotifications();
        logger.info(`Push registration completed in ${Date.now() - registerStart}ms`, 'NOTIFICATIONS');
      }

      this.isInitialized = true;
      logger.info(`NotificationService initialized (total time: ${Date.now() - startTime}ms)`, 'NOTIFICATIONS');
    } catch (error) {
      logger.error('Failed to initialize NotificationService', error as Error, 'NOTIFICATIONS');
      throw error;
    }
  }

  /**
   * Setup Android notification channels
   */
  private async setupAndroidChannels(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      // Default channel
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        description: 'Default notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Weather alerts channel
      await Notifications.setNotificationChannelAsync('weather-alerts', {
        name: 'Weather Alerts',
        description: 'Important weather alerts and warnings',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // UV alerts channel
      await Notifications.setNotificationChannelAsync('uv-alerts', {
        name: 'UV Alerts',
        description: 'UV index warnings and sunscreen reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFF5A623',
      });

      // Info channel
      await Notifications.setNotificationChannelAsync('info', {
        name: 'Info',
        description: 'General information and tips',
        importance: Notifications.AndroidImportance.LOW,
        sound: null,
      });

      logger.info('Android notification channels configured', 'NOTIFICATIONS');
    } catch (error) {
      logger.error('Failed to setup Android channels', error as Error, 'NOTIFICATIONS');
    }
  }

  /**
   * Request notification permissions
   */
  public async requestPermissions(): Promise<NotificationPermission> {
    try {
      logger.info('Requesting notification permissions', 'NOTIFICATIONS');

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const permission: NotificationPermission = {
        status: finalStatus === 'granted' ? 'granted' : 
                finalStatus === 'denied' ? 'denied' : 'undetermined',
        canAskAgain: finalStatus !== 'denied',
        lastAskedAt: Date.now(),
        canOpenSettings: true,
      };

      // Save permission status
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, JSON.stringify(permission));

      logger.info(`Notification permission: ${permission.status}`, 'NOTIFICATIONS');
      return permission;
    } catch (error) {
      logger.error('Failed to request permissions', error as Error, 'NOTIFICATIONS');
      throw error;
    }
  }

  /**
   * Get current permission status
   */
  public async getPermissionStatus(): Promise<NotificationPermission> {
    try {
      // Try to get stored permission
      const stored = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_KEY);
      if (stored) {
        return JSON.parse(stored) as NotificationPermission;
      }

      // Get current system permission
      const { status } = await Notifications.getPermissionsAsync();
      
      const permission: NotificationPermission = {
        status: status === 'granted' ? 'granted' : 
                status === 'denied' ? 'denied' : 'undetermined',
        canAskAgain: status !== 'denied',
        canOpenSettings: true,
      };

      return permission;
    } catch (error) {
      logger.error('Failed to get permission status', error as Error, 'NOTIFICATIONS');
      return {
        status: 'undetermined',
        canAskAgain: true,
        canOpenSettings: false,
      };
    }
  }

  /**
   * Register for push notifications
   */
  public async registerForPushNotifications(): Promise<NotificationToken | null> {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        logger.warn('Push notifications require a physical device', 'NOTIFICATIONS');
        return null;
      }

      // Request permissions
      const permission = await this.requestPermissions();
      if (permission.status !== 'granted') {
        logger.warn('Notification permission not granted', 'NOTIFICATIONS');
        return null;
      }

      // Get push notification token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID,
      });

      const token: NotificationToken = {
        token: tokenData.data,
        platform: Platform.OS as 'ios' | 'android',
        registeredAt: Date.now(),
        deviceId: Device.modelId || undefined,
      };

      // Save token
      await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, JSON.stringify(token));

      logger.info('Registered for push notifications', 'NOTIFICATIONS', { 
        platform: token.platform,
        deviceId: token.deviceId,
      });

      return token;
    } catch (error) {
      logger.error('Failed to register for push notifications', error as Error, 'NOTIFICATIONS');
      return null;
    }
  }

  /**
   * Get stored notification token
   */
  public async getToken(): Promise<string | null> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
      if (stored) {
        const token = JSON.parse(stored) as NotificationToken;
        return token.token;
      }
      return null;
    } catch (error) {
      logger.error('Failed to get notification token', error as Error, 'NOTIFICATIONS');
      return null;
    }
  }

  /**
   * Unregister from push notifications
   */
  public async unregister(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTIFICATION_TOKEN_KEY);
      logger.info('Unregistered from push notifications', 'NOTIFICATIONS');
    } catch (error) {
      logger.error('Failed to unregister', error as Error, 'NOTIFICATIONS');
    }
  }

  /**
   * Schedule a local notification
   */
  public async scheduleNotification(notification: Omit<ScheduledNotification, 'id'>): Promise<string> {
    try {
      const trigger = this.convertTrigger(notification.trigger);

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.notification.title,
          body: notification.notification.body,
          data: notification.notification.data || {},
          badge: notification.notification.badge || undefined,
          sound: this.config.soundEnabled ? (notification.notification.sound || 'default') : undefined,
          categoryIdentifier: notification.notification.categoryId || undefined,
        },
        trigger,
      });

      logger.info('Scheduled notification', 'NOTIFICATIONS', { id });
      return id;
    } catch (error) {
      logger.error('Failed to schedule notification', error as Error, 'NOTIFICATIONS');
      throw error;
    }
  }

  /**
   * Convert trigger to Expo format
   */
  private convertTrigger(trigger: AnyNotificationTrigger): Notifications.NotificationTriggerInput {
    switch (trigger.type) {
      case 'date':
        return {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: (trigger as DateTrigger).date,
        };
      
      case 'interval':
        return {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: (trigger as IntervalTrigger).seconds,
          repeats: trigger.repeats || false,
        };
      
      case 'daily':
        const dailyTrigger = trigger as DailyTrigger;
        return {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: dailyTrigger.hour,
          minute: dailyTrigger.minute,
        };
      
      default:
        throw new Error(`Unsupported trigger type: ${(trigger as any).type}`);
    }
  }

  /**
   * Cancel a scheduled notification
   */
  public async cancelNotification(id: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      logger.info('Cancelled notification', 'NOTIFICATIONS', { id });
    } catch (error) {
      logger.error('Failed to cancel notification', error as Error, 'NOTIFICATIONS', { id });
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  public async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      logger.info('Cancelled all notifications', 'NOTIFICATIONS');
    } catch (error) {
      logger.error('Failed to cancel all notifications', error as Error, 'NOTIFICATIONS');
    }
  }

  /**
   * Get all scheduled notifications
   */
  public async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      
      return notifications.map(n => ({
        id: n.identifier,
        notification: {
          title: n.content.title || '',
          body: n.content.body || '',
          data: n.content.data,
          badge: n.content.badge ?? undefined,
          sound: n.content.sound ? String(n.content.sound) : undefined,
          categoryId: n.content.categoryIdentifier ?? undefined,
        },
        trigger: this.convertExpoTrigger(n.trigger),
        createdAt: Date.now(), // Not available from Expo
      }));
    } catch (error) {
      logger.error('Failed to get scheduled notifications', error as Error, 'NOTIFICATIONS');
      return [];
    }
  }

  /**
   * Convert Expo trigger to our format
   */
  private convertExpoTrigger(trigger: any): AnyNotificationTrigger {
    // This is a best-effort conversion since Expo doesn't expose full trigger details
    if (trigger?.type === 'date') {
      return {
        type: 'date',
        date: new Date(trigger.value),
        repeats: trigger.repeats || false,
      };
    }
    
    // Default to interval trigger
    return {
      type: 'interval',
      seconds: 60,
      repeats: false,
    };
  }

  /**
   * Present a notification immediately
   */
  public async presentNotification(payload: NotificationPayload): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          badge: payload.badge,
          sound: this.config.soundEnabled ? (payload.sound || 'default') : undefined,
          categoryIdentifier: payload.categoryId,
        },
        trigger: null, // Immediate
      });

      logger.info('Presented notification', 'NOTIFICATIONS');
    } catch (error) {
      logger.error('Failed to present notification', error as Error, 'NOTIFICATIONS');
    }
  }

  /**
   * Set badge count
   */
  public async setBadgeCount(count: number): Promise<void> {
    if (!this.config.badgeEnabled) {
      return;
    }

    try {
      await Notifications.setBadgeCountAsync(count);
      logger.info(`Set badge count: ${count}`, 'NOTIFICATIONS');
    } catch (error) {
      logger.error('Failed to set badge count', error as Error, 'NOTIFICATIONS');
    }
  }

  /**
   * Get badge count
   */
  public async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      logger.error('Failed to get badge count', error as Error, 'NOTIFICATIONS');
      return 0;
    }
  }

  /**
   * Clear badge
   */
  public async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
      logger.info('Cleared badge', 'NOTIFICATIONS');
    } catch (error) {
      logger.error('Failed to clear badge', error as Error, 'NOTIFICATIONS');
    }
  }

  /**
   * Add notification received handler
   */
  public onNotificationReceived(
    handler: (notification: Notifications.Notification) => void
  ): () => void {
    if (this.notificationListeners.received) {
      this.notificationListeners.received.remove();
    }

    this.notificationListeners.received = Notifications.addNotificationReceivedListener(notification => {
      logger.info('Notification received', 'NOTIFICATIONS', {
        id: notification.request.identifier,
        title: notification.request.content.title,
      });
      handler(notification);
    });

    return () => {
      if (this.notificationListeners.received) {
        this.notificationListeners.received.remove();
        this.notificationListeners.received = undefined;
      }
    };
  }

  /**
   * Add notification response handler (user tapped notification)
   */
  public onNotificationResponse(
    handler: (response: NotificationResponse) => void
  ): () => void {
    if (this.notificationListeners.response) {
      this.notificationListeners.response.remove();
    }

    this.notificationListeners.response = Notifications.addNotificationResponseReceivedListener(response => {
      logger.info('Notification response', 'NOTIFICATIONS', {
        id: response.notification.request.identifier,
        actionIdentifier: response.actionIdentifier,
      });

      const mappedResponse: NotificationResponse = {
        notification: {
          identifier: response.notification.request.identifier,
          request: {
            identifier: response.notification.request.identifier,
            content: {
              title: response.notification.request.content.title || '',
              body: response.notification.request.content.body || '',
              data: response.notification.request.content.data,
            },
          },
          date: response.notification.date,
        },
        actionIdentifier: response.actionIdentifier,
        userText: response.userText,
      };

      handler(mappedResponse);
    });

    return () => {
      if (this.notificationListeners.response) {
        this.notificationListeners.response.remove();
        this.notificationListeners.response = undefined;
      }
    };
  }

  /**
   * Dismiss all notifications
   */
  public async dismissAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      logger.info('Dismissed all notifications', 'NOTIFICATIONS');
    } catch (error) {
      logger.error('Failed to dismiss notifications', error as Error, 'NOTIFICATIONS');
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<NotificationServiceConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Updated notification config', 'NOTIFICATIONS', { config });
  }

  /**
   * Get current configuration
   */
  public getConfig(): NotificationServiceConfig {
    return { ...this.config };
  }

  /**
   * Cleanup listeners
   */
  public cleanup(): void {
    if (this.notificationListeners.received) {
      this.notificationListeners.received.remove();
    }
    if (this.notificationListeners.response) {
      this.notificationListeners.response.remove();
    }
    logger.info('Cleaned up notification listeners', 'NOTIFICATIONS');
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

