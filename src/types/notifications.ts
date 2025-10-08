/**
 * Notification system TypeScript type definitions
 */

/**
 * Platform identifier for notification tokens
 */
export type NotificationPlatform = 'ios' | 'android' | 'web';

/**
 * Notification permission status
 */
export type NotificationPermissionStatus = 
  | 'granted'        // User has granted permission
  | 'denied'         // User has denied permission
  | 'undetermined';  // Permission not yet requested

/**
 * Notification token information
 */
export interface NotificationToken {
  /** Push notification token/device token */
  token: string;
  
  /** Platform identifier */
  platform: NotificationPlatform;
  
  /** Registration timestamp (Unix) */
  registeredAt: number;
  
  /** Optional expiration timestamp (Unix) */
  expiresAt?: number;
  
  /** Device identifier for tracking */
  deviceId?: string;
}

/**
 * Notification permission state
 */
export interface NotificationPermission {
  /** Current permission status */
  status: NotificationPermissionStatus;
  
  /** Whether the app can request permission again */
  canAskAgain: boolean;
  
  /** Last time permission was requested (Unix timestamp) */
  lastAskedAt?: number;
  
  /** Whether notification settings are available */
  canOpenSettings: boolean;
}

/**
 * Notification payload structure
 */
export interface NotificationPayload {
  /** Notification title */
  title: string;
  
  /** Notification body text */
  body: string;
  
  /** Custom data to pass with the notification */
  data?: Record<string, unknown>;
  
  /** Badge count to display on app icon */
  badge?: number;
  
  /** Sound identifier (use 'default' for default sound) */
  sound?: string | null;
  
  /** Notification category identifier */
  categoryId?: string;
  
  /** Thread identifier for grouping notifications */
  threadId?: string;
  
  /** Notification priority (Android) */
  priority?: 'min' | 'low' | 'default' | 'high' | 'max';
  
  /** Notification channel ID (Android) */
  channelId?: string;
  
  /** Subtitle (iOS only) */
  subtitle?: string;
  
  /** Color (Android only) */
  color?: string;
  
  /** Whether notification is sticky (Android) */
  sticky?: boolean;
  
  /** Auto-cancel on tap (Android) */
  autoCancel?: boolean;
}

/**
 * Notification trigger types
 */
export type NotificationTriggerType = 
  | 'date'           // Trigger at specific date/time
  | 'interval'       // Trigger after time interval
  | 'daily'          // Trigger daily at specific time
  | 'location';      // Trigger at specific location (future)

/**
 * Base notification trigger
 */
export interface NotificationTrigger {
  /** Trigger type */
  type: NotificationTriggerType;
  
  /** Whether the notification repeats */
  repeats?: boolean;
}

/**
 * Date-based notification trigger
 */
export interface DateTrigger extends NotificationTrigger {
  type: 'date';
  /** Trigger date */
  date: Date;
}

/**
 * Interval-based notification trigger
 */
export interface IntervalTrigger extends NotificationTrigger {
  type: 'interval';
  /** Interval in seconds */
  seconds: number;
}

/**
 * Daily notification trigger
 */
export interface DailyTrigger extends NotificationTrigger {
  type: 'daily';
  /** Hour (0-23) */
  hour: number;
  /** Minute (0-59) */
  minute: number;
}

/**
 * Union type for all trigger types
 */
export type AnyNotificationTrigger = DateTrigger | IntervalTrigger | DailyTrigger;

/**
 * Scheduled notification
 */
export interface ScheduledNotification {
  /** Unique notification identifier */
  id: string;
  
  /** Notification content */
  notification: NotificationPayload;
  
  /** Trigger configuration */
  trigger: AnyNotificationTrigger;
  
  /** Creation timestamp (Unix) */
  createdAt: number;
  
  /** Optional expiration timestamp (Unix) */
  expiresAt?: number;
}

/**
 * Notification action button
 */
export interface NotificationAction {
  /** Action identifier */
  id: string;
  
  /** Action button title */
  title: string;
  
  /** Whether action opens the app */
  opensApp?: boolean;
  
  /** Whether action requires text input */
  textInput?: boolean;
  
  /** Text input placeholder */
  textInputPlaceholder?: string;
  
  /** Action icon (Android) */
  icon?: string;
}

/**
 * Notification category (for action buttons)
 */
export interface NotificationCategory {
  /** Category identifier */
  id: string;
  
  /** Available actions */
  actions: NotificationAction[];
  
  /** Category options (iOS) */
  options?: {
    /** Allow in CarPlay */
    allowInCarPlay?: boolean;
    
    /** Allow announcement by Siri */
    allowAnnouncement?: boolean;
    
    /** Show previews */
    previewPlaceholder?: string;
  };
}

/**
 * Notification response (user interaction)
 */
export interface NotificationResponse {
  /** Notification that was interacted with */
  notification: ReceivedNotification;
  
  /** Action identifier (if action button was tapped) */
  actionIdentifier?: string;
  
  /** User input text (if text input action) */
  userText?: string;
}

/**
 * Received notification structure
 */
export interface ReceivedNotification {
  /** Notification identifier */
  identifier: string;
  
  /** Notification request */
  request: {
    /** Request identifier */
    identifier: string;
    
    /** Notification content */
    content: NotificationPayload;
    
    /** Trigger information */
    trigger?: {
      type: string;
      repeats: boolean;
    };
  };
  
  /** Date notification was received */
  date: number;
}

/**
 * Notification channel configuration (Android)
 */
export interface NotificationChannel {
  /** Channel identifier */
  id: string;
  
  /** Channel name */
  name: string;
  
  /** Channel description */
  description?: string;
  
  /** Importance level */
  importance: 'min' | 'low' | 'default' | 'high' | 'max';
  
  /** Whether to show badge */
  showBadge?: boolean;
  
  /** Sound URI */
  sound?: string;
  
  /** Vibration pattern */
  vibrationPattern?: number[];
  
  /** LED color */
  lightColor?: string;
  
  /** Whether to bypass Do Not Disturb */
  bypassDnd?: boolean;
}

/**
 * Notification service configuration
 */
export interface NotificationServiceConfig {
  /** Enable push notifications */
  enablePush: boolean;
  
  /** Enable local notifications */
  enableLocal: boolean;
  
  /** Enable notification sounds */
  soundEnabled: boolean;
  
  /** Enable badge counts */
  badgeEnabled: boolean;
  
  /** Auto-register on initialization */
  autoRegister: boolean;
  
  /** Android notification channels */
  androidChannels?: NotificationChannel[];
  
  /** iOS notification categories */
  iosCategories?: NotificationCategory[];
}

