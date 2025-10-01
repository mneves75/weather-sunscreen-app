/**
 * Message and messaging-related TypeScript type definitions
 */

/**
 * Message categories for organizing and filtering messages
 */
export type MessageCategory = 
  | 'weather-alert'    // Weather condition alerts (rain, wind, temperature)
  | 'uv-alert'         // UV index warnings and recommendations
  | 'system'           // System messages (updates, maintenance)
  | 'info';            // Informational messages (tips, recommendations)

/**
 * Message severity levels for visual and behavioral differentiation
 */
export type MessageSeverity = 
  | 'info'             // Informational, non-urgent
  | 'warning'          // Requires attention
  | 'critical';        // Urgent, immediate action required

/**
 * Core message data structure
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;
  
  /** Message category for filtering and organization */
  category: MessageCategory;
  
  /** Severity level for visual presentation and priority */
  severity: MessageSeverity;
  
  /** Message title/headline */
  title: string;
  
  /** Message body content */
  body: string;
  
  /** Unix timestamp of message creation */
  timestamp: number;
  
  /** Read/unread status */
  isRead: boolean;
  
  /** Optional structured data associated with the message */
  data?: {
    /** UV index value for UV-related messages */
    uvIndex?: number;
    
    /** Temperature value for weather messages */
    temperature?: number;
    
    /** Weather condition description */
    condition?: string;
    
    /** Location name for context */
    location?: string;
    
    /** SPF recommendation for UV alerts */
    spf?: number;
    
    /** Wind speed for weather alerts */
    windSpeed?: number;
    
    /** Precipitation probability for rain alerts */
    precipitationProbability?: number;
    
    /** Additional custom data */
    [key: string]: unknown;
  };
  
  /** Optional expiration timestamp (Unix) */
  expiresAt?: number;
  
  /** Optional URL for action button (deep link or external) */
  actionUrl?: string;
  
  /** Optional action button label */
  actionLabel?: string;
}

/**
 * Message filtering criteria
 */
export interface MessageFilter {
  /** Filter by one or more categories */
  categories?: MessageCategory[];
  
  /** Filter by one or more severity levels */
  severity?: MessageSeverity[];
  
  /** Filter by read status (true = read only, false = unread only, undefined = all) */
  isRead?: boolean;
  
  /** Filter by date range */
  dateRange?: {
    /** Start timestamp (Unix) */
    start: number;
    /** End timestamp (Unix) */
    end: number;
  };
  
  /** Search term for title/body filtering */
  searchTerm?: string;
}

/**
 * Message statistics for dashboard and UI
 */
export interface MessageStats {
  /** Total number of messages */
  total: number;
  
  /** Number of unread messages */
  unread: number;
  
  /** Count by category */
  byCategory: Record<MessageCategory, number>;
  
  /** Count by severity */
  bySeverity: Record<MessageSeverity, number>;
  
  /** Messages created today */
  today: number;
  
  /** Messages created this week */
  thisWeek: number;
}

/**
 * Message creation input (without generated fields)
 */
export type MessageInput = Omit<Message, 'id' | 'timestamp' | 'isRead'>;

/**
 * Message update input (partial updates)
 */
export type MessageUpdate = Partial<Omit<Message, 'id' | 'timestamp'>>;

/**
 * Message sorting options
 */
export type MessageSortField = 'timestamp' | 'severity' | 'category';

/**
 * Sort direction
 */
export type MessageSortDirection = 'asc' | 'desc';

/**
 * Message sort configuration
 */
export interface MessageSort {
  field: MessageSortField;
  direction: MessageSortDirection;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult {
  /** Number of successfully processed items */
  success: number;
  
  /** Number of failed items */
  failed: number;
  
  /** Error messages for failed items */
  errors?: Array<{ id: string; error: string }>;
}

