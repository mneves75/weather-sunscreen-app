/**
 * Alert Rule Engine
 * Evaluates weather and UV data against rules to generate alerts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './LoggerService';
import { messageService } from './MessageService';
import type {
  AlertRule,
  AlertRuleCondition,
  AlertRuleEvaluationResult,
  AlertRuleOperator,
  WeatherData,
  UVIndex,
  Message,
  MessageInput,
  SkinType,
} from '@/src/types';

const ALERT_RULES_STORAGE_KEY = '@WeatherSunscreen:alertRules';

/**
 * Alert Rule Engine singleton
 * Manages alert rules and evaluates them against data
 */
class AlertRuleEngine {
  private static instance: AlertRuleEngine;
  private rules: AlertRule[] = [];
  private isInitialized = false;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AlertRuleEngine {
    if (!AlertRuleEngine.instance) {
      AlertRuleEngine.instance = new AlertRuleEngine();
    }
    return AlertRuleEngine.instance;
  }

  /**
   * Initialize engine with default rules
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('Initializing AlertRuleEngine', 'ALERTS');

      // Load rules from storage
      await this.loadRules();

      // If no rules exist, initialize defaults
      if (this.rules.length === 0) {
        await this.initializeDefaultRules();
      }

      this.isInitialized = true;
      logger.info(`AlertRuleEngine initialized with ${this.rules.length} rules`, 'ALERTS');
    } catch (error) {
      logger.error('Failed to initialize AlertRuleEngine', error as Error, 'ALERTS');
      throw error;
    }
  }

  /**
   * Load rules from storage
   */
  private async loadRules(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(ALERT_RULES_STORAGE_KEY);
      if (stored) {
        this.rules = JSON.parse(stored) as AlertRule[];
        logger.info(`Loaded ${this.rules.length} alert rules`, 'ALERTS');
      }
    } catch (error) {
      logger.error('Failed to load alert rules', error as Error, 'ALERTS');
      this.rules = [];
    }
  }

  /**
   * Save rules to storage
   */
  private async saveRules(): Promise<void> {
    try {
      await AsyncStorage.setItem(ALERT_RULES_STORAGE_KEY, JSON.stringify(this.rules));
      logger.info(`Saved ${this.rules.length} alert rules`, 'ALERTS');
    } catch (error) {
      logger.error('Failed to save alert rules', error as Error, 'ALERTS');
      throw error;
    }
  }

  /**
   * Initialize default alert rules
   */
  public async initializeDefaultRules(): Promise<void> {
    logger.info('Initializing default alert rules', 'ALERTS');

    const defaultRules: Omit<AlertRule, 'id'>[] = [
      // High UV Alert
      {
        name: 'High UV Alert',
        type: 'uv',
        enabled: true,
        description: 'Alert when UV index is high (8+)',
        conditions: [
          { field: 'current', operator: 'gte', value: 8 },
        ],
        message: {
          title: 'High UV Alert',
          body: 'UV index is {{current}}. {{riskLevel}}. Apply SPF {{spf}}+ sunscreen.',
          severity: 'warning',
          actionLabel: 'View Recommendations',
          actionUrl: '/(tabs)/(home)/uv',
        },
        cooldownMinutes: 180, // 3 hours
        priority: 2,
        triggerNotification: true,
      },
      // Extreme UV Alert
      {
        name: 'Extreme UV Alert',
        type: 'uv',
        enabled: true,
        description: 'Critical alert when UV index is extreme (11+)',
        conditions: [
          { field: 'current', operator: 'gte', value: 11 },
        ],
        message: {
          title: 'Extreme UV Alert',
          body: 'UV index is {{current}} - EXTREME. Avoid sun exposure. Apply SPF 50+ and reapply every 2 hours.',
          severity: 'critical',
          actionLabel: 'View Safety Tips',
          actionUrl: '/(tabs)/(home)/uv',
        },
        cooldownMinutes: 120, // 2 hours
        priority: 1,
        triggerNotification: true,
      },
      // High Temperature Warning
      {
        name: 'High Temperature Warning',
        type: 'weather',
        enabled: true,
        description: 'Alert for extreme heat (35°C+)',
        conditions: [
          { field: 'temperature', operator: 'gte', value: 35 },
        ],
        message: {
          title: 'Extreme Heat Warning',
          body: 'Temperature is {{temperature}}°C. Stay hydrated and avoid direct sun exposure.',
          severity: 'warning',
          actionLabel: 'View Weather',
          actionUrl: '/(tabs)/(home)/weather',
        },
        cooldownMinutes: 240, // 4 hours
        priority: 2,
        triggerNotification: true,
      },
      // Freezing Temperature Warning
      {
        name: 'Freezing Temperature Warning',
        type: 'weather',
        enabled: true,
        description: 'Alert for freezing temperatures (0°C or below)',
        conditions: [
          { field: 'temperature', operator: 'lte', value: 0 },
        ],
        message: {
          title: 'Freezing Temperature Alert',
          body: 'Temperature is {{temperature}}°C. Protect exposed skin and dress warmly.',
          severity: 'warning',
          actionLabel: 'View Weather',
          actionUrl: '/(tabs)/(home)/weather',
        },
        cooldownMinutes: 240, // 4 hours
        priority: 2,
        triggerNotification: true,
      },
      // Rain Alert
      {
        name: 'Rain Alert',
        type: 'weather',
        enabled: true,
        description: 'Alert for high chance of rain (70%+)',
        conditions: [
          { field: 'precipitationProbability', operator: 'gte', value: 70 },
        ],
        message: {
          title: 'Rain Expected',
          body: '{{precipitationProbability}}% chance of rain. Don\'t forget your umbrella!',
          severity: 'info',
          actionLabel: 'View Forecast',
          actionUrl: '/(tabs)/(home)/forecast',
        },
        cooldownMinutes: 360, // 6 hours
        priority: 3,
        triggerNotification: false, // Less urgent, in-app only
      },
      // High Wind Warning
      {
        name: 'High Wind Warning',
        type: 'weather',
        enabled: true,
        description: 'Alert for dangerous wind speeds (50+ km/h)',
        conditions: [
          { field: 'windSpeed', operator: 'gte', value: 50 },
        ],
        message: {
          title: 'High Wind Warning',
          body: 'Wind speed is {{windSpeed}} km/h. Be cautious outdoors.',
          severity: 'warning',
          actionLabel: 'View Details',
          actionUrl: '/(tabs)/(home)/weather',
        },
        cooldownMinutes: 180, // 3 hours
        priority: 2,
        triggerNotification: true,
        },
      // Poor Visibility Warning
      {
        name: 'Poor Visibility Warning',
        type: 'weather',
        enabled: true,
        description: 'Alert for poor visibility (<1 km)',
        conditions: [
          { field: 'visibility', operator: 'lt', value: 1000 }, // meters
        ],
        message: {
          title: 'Poor Visibility',
          body: 'Visibility is {{visibility}}m. Drive carefully and use headlights.',
          severity: 'warning',
          actionLabel: 'View Weather',
          actionUrl: '/(tabs)/(home)/weather',
        },
        cooldownMinutes: 180, // 3 hours
        priority: 2,
        triggerNotification: true,
      },
    ];

    // Create rules with generated IDs
    for (const rule of defaultRules) {
      await this.createRule(rule);
    }

    logger.info(`Created ${defaultRules.length} default alert rules`, 'ALERTS');
  }

  /**
   * Create a new alert rule
   */
  public async createRule(rule: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    const newRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.rules.push(newRule);
    await this.saveRules();

    logger.info(`Created alert rule: ${newRule.name}`, 'ALERTS', { id: newRule.id });
    return newRule;
  }

  /**
   * Get all rules
   */
  public async getRules(): Promise<AlertRule[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return [...this.rules];
  }

  /**
   * Get rule by ID
   */
  public async getRuleById(id: string): Promise<AlertRule | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.rules.find(r => r.id === id) || null;
  }

  /**
   * Update a rule
   */
  public async updateRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const index = this.rules.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Alert rule not found: ${id}`);
    }

    const updated = { ...this.rules[index], ...updates, id }; // Preserve ID
    this.rules[index] = updated;

    await this.saveRules();
    logger.info(`Updated alert rule: ${id}`, 'ALERTS', { updates });

    return updated;
  }

  /**
   * Delete a rule
   */
  public async deleteRule(id: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const index = this.rules.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Alert rule not found: ${id}`);
    }

    this.rules.splice(index, 1);
    await this.saveRules();
    logger.info(`Deleted alert rule: ${id}`, 'ALERTS');
  }

  /**
   * Evaluate all rules against provided data
   */
  public async evaluateRules(data: {
    weather?: WeatherData;
    uvIndex?: UVIndex;
    skinType?: SkinType;
  }): Promise<Message[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const messages: Message[] = [];
    const enabledRules = this.rules.filter(r => r.enabled);

    logger.info(`Evaluating ${enabledRules.length} alert rules`, 'ALERTS');

    for (const rule of enabledRules) {
      try {
        const result = await this.evaluateRule(rule, data);
        
        if (result.triggered && !result.inCooldown) {
          // Generate message from rule
          const message = await this.generateMessageFromRule(rule, data);
          messages.push(message);

          // Update last triggered timestamp
          rule.lastTriggered = Date.now();
          await this.saveRules();

          logger.info(`Alert triggered: ${rule.name}`, 'ALERTS', {
            ruleId: rule.id,
            messageId: message.id,
          });
        } else if (result.inCooldown) {
          logger.info(`Alert in cooldown: ${rule.name}`, 'ALERTS', { ruleId: rule.id });
        }
      } catch (error) {
        logger.error(`Error evaluating rule: ${rule.name}`, error as Error, 'ALERTS', {
          ruleId: rule.id,
        });
      }
    }

    return messages;
  }

  /**
   * Evaluate a single rule
   */
  private async evaluateRule(
    rule: AlertRule,
    data: { weather?: WeatherData; uvIndex?: UVIndex; skinType?: SkinType }
  ): Promise<AlertRuleEvaluationResult> {
    // Check cooldown
    const inCooldown = this.isInCooldown(rule);

    // Build evaluation context
    const context = this.buildEvaluationContext(rule, data);

    // Evaluate conditions
    const conditionLogic = rule.conditionLogic || 'and';
    let triggered = false;

    if (conditionLogic === 'and') {
      triggered = rule.conditions.every(condition => 
        this.evaluateCondition(condition, context)
      );
    } else {
      triggered = rule.conditions.some(condition => 
        this.evaluateCondition(condition, context)
      );
    }

    const reason = triggered
      ? `Conditions met (${conditionLogic.toUpperCase()})`
      : `Conditions not met (${conditionLogic.toUpperCase()})`;

    return {
      rule,
      triggered,
      reason,
      inCooldown,
      context,
    };
  }

  /**
   * Check if rule is in cooldown period
   */
  private isInCooldown(rule: AlertRule): boolean {
    if (!rule.lastTriggered) {
      return false;
    }

    const cooldownMs = rule.cooldownMinutes * 60 * 1000;
    const timeSinceLastTrigger = Date.now() - rule.lastTriggered;

    return timeSinceLastTrigger < cooldownMs;
  }

  /**
   * Build evaluation context from data
   */
  private buildEvaluationContext(
    rule: AlertRule,
    data: { weather?: WeatherData; uvIndex?: UVIndex; skinType?: SkinType }
  ): Record<string, unknown> {
    const context: Record<string, unknown> = {};

    if (rule.type === 'weather' && data.weather) {
      context.temperature = data.weather.current.temperature;
      context.feelsLike = data.weather.current.feelsLike;
      context.humidity = data.weather.current.humidity;
      context.pressure = data.weather.current.pressure;
      context.windSpeed = data.weather.current.windSpeed;
      context.windDirection = data.weather.current.windDirection;
      context.visibility = data.weather.current.visibility;
      context.cloudCover = data.weather.current.cloudCover;
      context.condition = data.weather.current.condition;
      context.precipitationProbability = data.weather.current.precipitationProbability || 0;
    }

    if (rule.type === 'uv' && data.uvIndex) {
      context.current = data.uvIndex.current;
      context.max = data.uvIndex.max;
      context.peakTime = data.uvIndex.peakTime;
      context.level = data.uvIndex.level;
      context.riskLevel = this.getUVRiskDescription(data.uvIndex.level);
      
      // Calculate SPF recommendation based on skin type and UV index
      if (data.skinType) {
        context.spf = this.calculateSPF(data.uvIndex.current, data.skinType);
      }
    }

    return context;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: AlertRuleCondition, context: Record<string, unknown>): boolean {
    const value = context[condition.field];

    if (value === undefined || value === null) {
      return false;
    }

    return this.compareValues(value, condition.operator, condition.value);
  }

  /**
   * Compare values based on operator
   */
  private compareValues(
    actual: unknown,
    operator: AlertRuleOperator,
    expected: number | string | boolean
  ): boolean {
    switch (operator) {
      case 'eq':
        return actual === expected;
      case 'neq':
        return actual !== expected;
      case 'gt':
        return Number(actual) > Number(expected);
      case 'gte':
        return Number(actual) >= Number(expected);
      case 'lt':
        return Number(actual) < Number(expected);
      case 'lte':
        return Number(actual) <= Number(expected);
      default:
        return false;
    }
  }

  /**
   * Generate message from rule
   */
  private async generateMessageFromRule(
    rule: AlertRule,
    data: { weather?: WeatherData; uvIndex?: UVIndex; skinType?: SkinType }
  ): Promise<Message> {
    const context = this.buildEvaluationContext(rule, data);

    // Interpolate message title and body
    const title = this.interpolateTemplate(rule.message.title, context);
    const body = this.interpolateTemplate(rule.message.body, context);

    const messageInput: MessageInput = {
      category: rule.type === 'weather' ? 'weather-alert' : 'uv-alert',
      severity: rule.message.severity,
      title,
      body,
      data: {
        ...context,
        ruleId: rule.id,
        ruleName: rule.name,
      },
      actionLabel: rule.message.actionLabel,
      actionUrl: rule.message.actionUrl,
    };

    return await messageService.createMessage(messageInput);
  }

  /**
   * Interpolate template string with context values
   */
  private interpolateTemplate(template: string, context: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = context[key];
      if (value === undefined || value === null) {
        return match;
      }
      return String(value);
    });
  }

  /**
   * Get UV risk level description
   */
  private getUVRiskDescription(level: string): string {
    switch (level) {
      case 'low':
        return 'Low risk';
      case 'moderate':
        return 'Moderate risk - protection recommended';
      case 'high':
        return 'High risk - protection required';
      case 'very-high':
        return 'Very high risk - extra protection required';
      case 'extreme':
        return 'Extreme risk - avoid sun exposure';
      default:
        return 'Unknown risk';
    }
  }

  /**
   * Calculate SPF recommendation based on UV index and skin type
   */
  private calculateSPF(uvIndex: number, skinType: SkinType): number {
    const baseSPF = uvIndex < 3 ? 15 : uvIndex < 6 ? 30 : uvIndex < 8 ? 40 : 50;

    // Adjust for skin type
    const skinTypeMultiplier: Record<SkinType, number> = {
      'very-fair': 1.2,
      'fair': 1.1,
      'medium': 1.0,
      'olive': 0.9,
      'brown': 0.9,
      'black': 0.8,
    };

    const adjustedSPF = Math.ceil(baseSPF * skinTypeMultiplier[skinType]);
    return Math.min(Math.max(adjustedSPF, 15), 50); // Clamp between 15 and 50
  }

  /**
   * Reset engine (for testing)
   */
  public async reset(): Promise<void> {
    this.rules = [];
    this.isInitialized = false;
    await AsyncStorage.removeItem(ALERT_RULES_STORAGE_KEY);
    logger.info('AlertRuleEngine reset', 'ALERTS');
  }
}

// Export singleton instance
export const alertRuleEngine = AlertRuleEngine.getInstance();

