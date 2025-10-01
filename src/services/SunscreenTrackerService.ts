/**
 * Sunscreen Tracker Service
 * Calculates optimal sunscreen reapplication timing based on weather conditions
 * Following dermatological best practices and SPF effectiveness research
 */

import { ReapplicationConditions, ReapplicationResult } from '../types/sunscreen';
import { logger } from './LoggerService';

export class SunscreenTrackerService {
  /**
   * Base reapplication time in minutes (standard recommendation)
   */
  private static readonly BASE_REAPPLICATION_MINUTES = 120;

  /**
   * Calculate recommended reapplication time based on weather conditions
   * 
   * Algorithm based on:
   * - UV Index impact on SPF degradation
   * - Humidity impact on sunscreen adherence
   * - Cloud cover impact on UV exposure
   * - Water exposure impact on sunscreen persistence
   * 
   * @param conditions Current weather conditions
   * @returns Calculation result with timing and reasoning
   */
  public static calculateReapplicationTime(
    conditions: ReapplicationConditions
  ): ReapplicationResult {
    const { uvIndex, humidity, cloudCover, isSwimming = false } = conditions;

    logger.info('Calculating reapplication time', 'SUNSCREEN', { conditions });

    // Start with base time
    let baseTime = this.BASE_REAPPLICATION_MINUTES;
    let uvAdjustment = 0;
    let humidityAdjustment = 0;
    let cloudAdjustment = 0;
    let swimmingAdjustment = 0;

    // UV Index adjustment (primary factor)
    // Higher UV = faster SPF degradation
    if (uvIndex >= 11) {
      // Extreme: 45 minutes
      uvAdjustment = -75;
    } else if (uvIndex >= 8) {
      // Very High: 60 minutes
      uvAdjustment = -60;
    } else if (uvIndex >= 6) {
      // High: 90 minutes
      uvAdjustment = -30;
    } else if (uvIndex >= 3) {
      // Moderate: 120 minutes (no adjustment)
      uvAdjustment = 0;
    } else {
      // Low: 180 minutes
      uvAdjustment = 60;
    }

    // Humidity adjustment
    // High humidity (>80%) reduces adherence by ~25%
    if (humidity > 80) {
      humidityAdjustment = -30; // 25% reduction
    } else if (humidity > 60) {
      humidityAdjustment = -15; // 12.5% reduction
    }

    // Cloud cover adjustment
    // Clouds reduce UV exposure, allowing longer intervals
    if (cloudCover > 75) {
      cloudAdjustment = 30; // 25% increase
    } else if (cloudCover > 50) {
      cloudAdjustment = 15; // 12.5% increase
    }

    // Swimming/water exposure adjustment
    // Water removes sunscreen, even "water-resistant" products
    if (isSwimming) {
      swimmingAdjustment = -60; // 50% reduction
    }

    // Calculate total
    const totalMinutes = Math.max(
      30, // Minimum 30 minutes
      baseTime + uvAdjustment + humidityAdjustment + cloudAdjustment + swimmingAdjustment
    );

    // Generate reasoning
    const reason = this.generateReason(uvIndex, humidity, cloudCover, isSwimming);

    const result: ReapplicationResult = {
      minutes: Math.round(totalMinutes),
      reason,
      factors: {
        baseTime,
        uvAdjustment,
        humidityAdjustment,
        cloudAdjustment,
        swimmingAdjustment,
      },
    };

    logger.info('Reapplication time calculated', 'SUNSCREEN', { result });

    return result;
  }

  /**
   * Generate human-readable reason for the recommendation
   */
  private static generateReason(
    uvIndex: number,
    humidity: number,
    cloudCover: number,
    isSwimming: boolean
  ): string {
    const reasons: string[] = [];

    // UV Index reasoning
    if (uvIndex >= 11) {
      reasons.push('Extreme UV exposure');
    } else if (uvIndex >= 8) {
      reasons.push('Very high UV exposure');
    } else if (uvIndex >= 6) {
      reasons.push('High UV exposure');
    } else if (uvIndex >= 3) {
      reasons.push('Moderate UV exposure');
    } else {
      reasons.push('Low UV exposure');
    }

    // Additional factors
    if (isSwimming) {
      reasons.push('water exposure');
    }
    if (humidity > 80) {
      reasons.push('high humidity');
    }
    if (cloudCover > 75) {
      reasons.push('heavy cloud cover');
    }

    return reasons.join(', ');
  }

  /**
   * Check if reapplication is needed
   * @param appliedAt Timestamp when sunscreen was applied
   * @param reapplyAt Timestamp when reapplication is needed
   * @returns True if reapplication is needed now
   */
  public static isReapplicationNeeded(appliedAt: number, reapplyAt: number): boolean {
    const now = Date.now();
    return now >= reapplyAt;
  }

  /**
   * Get time remaining until reapplication
   * @param reapplyAt Timestamp when reapplication is needed
   * @returns Minutes remaining, or 0 if already past due
   */
  public static getTimeRemaining(reapplyAt: number): number {
    const now = Date.now();
    const remainingMs = reapplyAt - now;
    return Math.max(0, Math.round(remainingMs / 60000));
  }

  /**
   * Format time remaining as human-readable string
   * @param minutes Minutes remaining
   * @returns Formatted string (e.g., "1h 30m" or "45m")
   */
  public static formatTimeRemaining(minutes: number): string {
    if (minutes === 0) {
      return '0m';
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  }
}

