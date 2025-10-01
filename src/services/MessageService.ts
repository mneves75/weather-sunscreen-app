/**
 * Message Service
 * Handles message CRUD operations, filtering, and persistence
 */

import type {
  BatchOperationResult,
  Message,
  MessageCategory,
  MessageFilter,
  MessageInput,
  MessageServiceConfig,
  MessageSeverity,
  MessageSort,
  MessageStats,
  MessageUpdate,
} from '@/src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './LoggerService';

const MESSAGES_STORAGE_KEY = '@WeatherSunscreen:messages';
const CONFIG_STORAGE_KEY = '@WeatherSunscreen:messages:config';

const DEFAULT_CONFIG: MessageServiceConfig = {
  maxMessages: 500,
  retentionDays: 30,
  autoDeleteRead: false,
  batchSize: 50,
  autoCleanup: true,
};

/**
 * Message Service singleton
 * Manages message lifecycle, persistence, and operations
 */
class MessageService {
  private static instance: MessageService;
  private config: MessageServiceConfig = DEFAULT_CONFIG;
  private messages: Message[] = [];
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  /**
   * Initialize service
   * Loads messages from storage and performs cleanup
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initializeInternal();
    await this.initPromise;
    this.initPromise = null;
  }

  private async _initializeInternal(): Promise<void> {
    try {
      const startTime = Date.now();
      logger.info('Initializing MessageService', 'MESSAGES');

      // Load configuration
      logger.info('Loading message config...', 'MESSAGES');
      await this.loadConfig();
      logger.info(`Config loaded in ${Date.now() - startTime}ms`, 'MESSAGES');

      // Load messages
      const loadMessagesStart = Date.now();
      logger.info('Loading messages from storage...', 'MESSAGES');
      await this.loadMessages();
      logger.info(`Messages loaded in ${Date.now() - loadMessagesStart}ms`, 'MESSAGES');

      // Perform automatic cleanup if enabled
      if (this.config.autoCleanup) {
        const cleanupStart = Date.now();
        logger.info('Running message cleanup...', 'MESSAGES');
        await this.cleanupExpiredMessages();
        await this.cleanupOldMessages(this.config.retentionDays);
        logger.info(`Cleanup completed in ${Date.now() - cleanupStart}ms`, 'MESSAGES');
      }

      this.isInitialized = true;
      logger.info(`MessageService initialized with ${this.messages.length} messages (total time: ${Date.now() - startTime}ms)`, 'MESSAGES');
    } catch (error) {
      logger.error('Failed to initialize MessageService', error as Error, 'MESSAGES');
      throw error;
    }
  }

  /**
   * Load configuration from storage
   */
  private async loadConfig(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<MessageServiceConfig>;
        this.config = { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch (error) {
      logger.warn('Failed to load message config, using defaults', 'MESSAGES', { error });
      this.config = DEFAULT_CONFIG;
    }
  }

  /**
   * Load messages from storage
   */
  private async loadMessages(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      if (stored) {
        this.messages = JSON.parse(stored) as Message[];
        logger.info(`Loaded ${this.messages.length} messages from storage`, 'MESSAGES');
      }
    } catch (error) {
      logger.error('Failed to load messages', error as Error, 'MESSAGES');
      this.messages = [];
    }
  }

  /**
   * Save messages to storage
   */
  private async saveMessages(): Promise<void> {
    try {
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(this.messages));
      logger.info(`Saved ${this.messages.length} messages to storage`, 'MESSAGES');
    } catch (error) {
      logger.error('Failed to save messages', error as Error, 'MESSAGES');
      throw error;
    }
  }

  /**
   * Generate unique message ID
   */
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Create a new message
   */
  public async createMessage(input: MessageInput): Promise<Message> {
    await this.ensureInitialized();

    const message: Message = {
      ...input,
      id: this.generateId(),
      timestamp: Date.now(),
      isRead: false,
    };

    // Add message to beginning of array (newest first)
    this.messages.unshift(message);

    // Enforce max message limit
    if (this.messages.length > this.config.maxMessages) {
      const removed = this.messages.splice(this.config.maxMessages);
      logger.info(`Removed ${removed.length} old messages (max limit: ${this.config.maxMessages})`, 'MESSAGES');
    }

    await this.saveMessages();
    logger.info(`Created message: ${message.title}`, 'MESSAGES', { id: message.id, category: message.category });

    return message;
  }

  /**
   * Get all messages with optional filtering and sorting
   */
  public async getMessages(filter?: MessageFilter, sort?: MessageSort): Promise<Message[]> {
    await this.ensureInitialized();

    let filtered = [...this.messages];

    // Apply filters
    if (filter) {
      filtered = this.applyFilter(filtered, filter);
    }

    // Apply sorting
    if (sort) {
      filtered = this.applySort(filtered, sort);
    }

    return filtered;
  }

  /**
   * Get message by ID
   */
  public async getMessageById(id: string): Promise<Message | null> {
    await this.ensureInitialized();
    return this.messages.find(m => m.id === id) || null;
  }

  /**
   * Update a message
   */
  public async updateMessage(id: string, updates: MessageUpdate): Promise<Message> {
    await this.ensureInitialized();

    const index = this.messages.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error(`Message not found: ${id}`);
    }

    const updated = { ...this.messages[index], ...updates };
    this.messages[index] = updated;

    await this.saveMessages();
    logger.info(`Updated message: ${id}`, 'MESSAGES', { updates });

    return updated;
  }

  /**
   * Delete a message
   */
  public async deleteMessage(id: string): Promise<void> {
    await this.ensureInitialized();

    const index = this.messages.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error(`Message not found: ${id}`);
    }

    this.messages.splice(index, 1);
    await this.saveMessages();
    logger.info(`Deleted message: ${id}`, 'MESSAGES');
  }

  /**
   * Mark messages as read
   */
  public async markAsRead(ids: string[]): Promise<BatchOperationResult> {
    await this.ensureInitialized();

    const result: BatchOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const id of ids) {
      try {
        const index = this.messages.findIndex(m => m.id === id);
        if (index !== -1) {
          this.messages[index].isRead = true;
          result.success++;
        } else {
          result.failed++;
          result.errors?.push({ id, error: 'Message not found' });
        }
      } catch (error) {
        result.failed++;
        result.errors?.push({ id, error: (error as Error).message });
      }
    }

    if (result.success > 0) {
      await this.saveMessages();
      logger.info(`Marked ${result.success} messages as read`, 'MESSAGES');
    }

    return result;
  }

  /**
   * Mark all messages as read (optionally filtered by category)
   */
  public async markAllAsRead(category?: MessageCategory): Promise<number> {
    await this.ensureInitialized();

    let count = 0;
    for (const message of this.messages) {
      if (!message.isRead && (!category || message.category === category)) {
        message.isRead = true;
        count++;
      }
    }

    if (count > 0) {
      await this.saveMessages();
      logger.info(`Marked ${count} messages as read${category ? ` (category: ${category})` : ''}`, 'MESSAGES');
    }

    return count;
  }

  /**
   * Delete multiple messages
   */
  public async deleteMessages(ids: string[]): Promise<BatchOperationResult> {
    await this.ensureInitialized();

    const result: BatchOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Delete in reverse order to maintain indices
    for (const id of ids) {
      try {
        const index = this.messages.findIndex(m => m.id === id);
        if (index !== -1) {
          this.messages.splice(index, 1);
          result.success++;
        } else {
          result.failed++;
          result.errors?.push({ id, error: 'Message not found' });
        }
      } catch (error) {
        result.failed++;
        result.errors?.push({ id, error: (error as Error).message });
      }
    }

    if (result.success > 0) {
      await this.saveMessages();
      logger.info(`Deleted ${result.success} messages`, 'MESSAGES');
    }

    return result;
  }

  /**
   * Delete all messages (optionally filtered by category)
   */
  public async deleteAllMessages(category?: MessageCategory): Promise<number> {
    await this.ensureInitialized();

    const initialCount = this.messages.length;

    if (category) {
      this.messages = this.messages.filter(m => m.category !== category);
    } else {
      this.messages = [];
    }

    const deleted = initialCount - this.messages.length;

    if (deleted > 0) {
      await this.saveMessages();
      logger.info(`Deleted ${deleted} messages${category ? ` (category: ${category})` : ''}`, 'MESSAGES');
    }

    return deleted;
  }

  /**
   * Get message statistics
   */
  public async getStats(): Promise<MessageStats> {
    await this.ensureInitialized();

    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    const stats: MessageStats = {
      total: this.messages.length,
      unread: 0,
      byCategory: {
        'weather-alert': 0,
        'uv-alert': 0,
        'system': 0,
        'info': 0,
      },
      bySeverity: {
        'info': 0,
        'warning': 0,
        'critical': 0,
      },
      today: 0,
      thisWeek: 0,
    };

    for (const message of this.messages) {
      if (!message.isRead) {
        stats.unread++;
      }

      stats.byCategory[message.category]++;
      stats.bySeverity[message.severity]++;

      if (message.timestamp >= oneDayAgo) {
        stats.today++;
      }
      if (message.timestamp >= oneWeekAgo) {
        stats.thisWeek++;
      }
    }

    return stats;
  }

  /**
   * Get unread count
   */
  public async getUnreadCount(): Promise<number> {
    await this.ensureInitialized();
    return this.messages.filter(m => !m.isRead).length;
  }

  /**
   * Clean up expired messages
   */
  public async cleanupExpiredMessages(): Promise<number> {
    await this.ensureInitialized();

    const now = Date.now();
    const initialCount = this.messages.length;

    this.messages = this.messages.filter(m => !m.expiresAt || m.expiresAt > now);

    const deleted = initialCount - this.messages.length;

    if (deleted > 0) {
      await this.saveMessages();
      logger.info(`Cleaned up ${deleted} expired messages`, 'MESSAGES');
    }

    return deleted;
  }

  /**
   * Clean up old messages
   */
  public async cleanupOldMessages(daysOld: number): Promise<number> {
    await this.ensureInitialized();

    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const initialCount = this.messages.length;

    // Keep unread messages, delete old read messages
    this.messages = this.messages.filter(m => 
      !m.isRead || m.timestamp >= cutoffTime
    );

    const deleted = initialCount - this.messages.length;

    if (deleted > 0) {
      await this.saveMessages();
      logger.info(`Cleaned up ${deleted} old messages (older than ${daysOld} days)`, 'MESSAGES');
    }

    return deleted;
  }

  /**
   * Apply filter to messages
   */
  private applyFilter(messages: Message[], filter: MessageFilter): Message[] {
    let filtered = [...messages];

    // Filter by categories
    if (filter.categories && filter.categories.length > 0) {
      filtered = filtered.filter(m => filter.categories!.includes(m.category));
    }

    // Filter by severity
    if (filter.severity && filter.severity.length > 0) {
      filtered = filtered.filter(m => filter.severity!.includes(m.severity));
    }

    // Filter by read status
    if (filter.isRead !== undefined) {
      filtered = filtered.filter(m => m.isRead === filter.isRead);
    }

    // Filter by date range
    if (filter.dateRange) {
      filtered = filtered.filter(m => 
        m.timestamp >= filter.dateRange!.start && 
        m.timestamp <= filter.dateRange!.end
      );
    }

    // Filter by search term
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchLower) ||
        m.body.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  /**
   * Apply sorting to messages
   */
  private applySort(messages: Message[], sort: MessageSort): Message[] {
    const sorted = [...messages];

    sorted.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sort.field) {
        case 'timestamp':
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        case 'severity':
          // Critical > Warning > Info
          const severityOrder: Record<MessageSeverity, number> = {
            critical: 3,
            warning: 2,
            info: 1,
          };
          aValue = severityOrder[a.severity];
          bValue = severityOrder[b.severity];
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  /**
   * Update service configuration
   */
  public async updateConfig(config: Partial<MessageServiceConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    logger.info('Updated message service config', 'MESSAGES', { config });
  }

  /**
   * Get current configuration
   */
  public getConfig(): MessageServiceConfig {
    return { ...this.config };
  }

  /**
   * Reset service (for testing)
   */
  public async reset(): Promise<void> {
    this.messages = [];
    this.config = DEFAULT_CONFIG;
    this.isInitialized = false;
    await AsyncStorage.removeItem(MESSAGES_STORAGE_KEY);
    await AsyncStorage.removeItem(CONFIG_STORAGE_KEY);
    logger.info('MessageService reset', 'MESSAGES');
  }
}

// Export singleton instance
export const messageService = MessageService.getInstance();

