/**
 * Sunscreen Tracker Types
 * Defines interfaces for sunscreen application tracking and reapplication alerts
 */

/**
 * Sunscreen application record
 */
export interface SunscreenApplication {
  /** Timestamp when sunscreen was applied */
  appliedAt: number;
  /** UV index at time of application */
  uvIndex: number;
  /** Temperature at time of application (Celsius) */
  temperature: number;
  /** Humidity percentage at time of application */
  humidity: number;
  /** Cloud cover percentage at time of application */
  cloudCover: number;
  /** Calculated reapplication time in minutes */
  reapplicationMinutes: number;
  /** Timestamp when reapplication is needed */
  reapplyAt: number;
}

/**
 * Sunscreen tracker state
 */
export interface SunscreenState {
  /** Current application record, null if not applied */
  currentApplication: SunscreenApplication | null;
  /** Whether reapplication alert is active */
  alertActive: boolean;
  /** Whether user is in water/swimming mode */
  isSwimming: boolean;
}

/**
 * Weather conditions for reapplication calculation
 */
export interface ReapplicationConditions {
  uvIndex: number;
  temperature: number;
  humidity: number;
  cloudCover: number;
  isSwimming?: boolean;
}

/**
 * Reapplication calculation result
 */
export interface ReapplicationResult {
  /** Recommended reapplication time in minutes */
  minutes: number;
  /** Reason for the recommendation */
  reason: string;
  /** Breakdown of factors affecting the calculation */
  factors: {
    baseTime: number;
    uvAdjustment: number;
    humidityAdjustment: number;
    cloudAdjustment: number;
    swimmingAdjustment: number;
  };
}

