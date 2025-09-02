import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './loggerService';
import { Platform } from 'react-native';
import {
  SunscreenApplication,
  SunscreenReminder,
  UserSunscreenProfile,
  SKIN_TYPES,
  SkinType,
} from '../types/sunscreen';
import { WeatherService } from './weatherService';
import { LocationService } from './locationService';
import { NotificationService } from './notificationService';

export class SunscreenService {
  private static readonly STORAGE_KEYS = {
    APPLICATIONS: '@sunscreen_applications',
    PROFILE: '@sunscreen_profile',
    REMINDERS: '@sunscreen_reminders',
  } as const;

  // Initialize notifications
  static async initializeNotifications(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') return false;
      const granted = await NotificationService.requestPermissions();
      if (!granted) {
        logger.warn('Notification permission not granted');
        return false;
      }
      // Ensure default handler is set (NotificationService sets one if available)
      logger.info('📱 Notifications initialized successfully');
      return granted;
    } catch (error) {
      logger.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  // Log sunscreen application
  static async logSunscreenApplication(
    spf: number,
    bodyParts: string[],
    notes?: string,
  ): Promise<SunscreenApplication> {
    try {
      // Get current location and weather data
      const location = await LocationService.getCurrentLocation();
      const locationInfo = await LocationService.getDetailedLocationInfo(location);
      const weatherData = await WeatherService.getCurrentWeatherData();

      const application: SunscreenApplication = {
        id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        spf,
        uvIndex: weatherData.uvIndex.value,
        location: {
          name: locationInfo.name,
          latitude: location.latitude,
          longitude: location.longitude,
        },
        reapplicationDue: await this.calculateReapplicationTime(spf, weatherData.uvIndex.value),
        bodyParts,
        notes,
      };

      // Save application
      await this.saveApplication(application);

      // Schedule reminder notification
      await this.scheduleReapplicationReminder(application);

      logger.info('🧴 Sunscreen application logged:', application);
      return application;
    } catch (error) {
      logger.error('Failed to log sunscreen application:', error);
      throw new Error('Failed to log sunscreen application. Please try again.');
    }
  }

  // Calculate when sunscreen needs to be reapplied
  private static async calculateReapplicationTime(spf: number, uvIndex: number): Promise<Date> {
    try {
      const profile = await this.getUserProfile();
      let baseTime = profile.skinType.baseReapplicationTime;

      // Use custom time if set
      if (profile.customReapplicationTime) {
        baseTime = profile.customReapplicationTime;
      }

      // Adjust based on UV index
      let uvMultiplier = 1.0;
      if (uvIndex >= 8)
        uvMultiplier = 0.6; // Very high UV - reduce time by 40%
      else if (uvIndex >= 6)
        uvMultiplier = 0.75; // High UV - reduce time by 25%
      else if (uvIndex >= 3) uvMultiplier = 0.9; // Moderate UV - reduce time by 10%

      // Adjust based on SPF (higher SPF can extend time slightly)
      let spfMultiplier = 1.0;
      if (spf >= 50) spfMultiplier = 1.15;
      else if (spf >= 30) spfMultiplier = 1.1;
      else if (spf < 15) spfMultiplier = 0.8;

      // Adjust for activities
      let activityMultiplier = 1.0;
      if (profile.sportActivity) activityMultiplier = 0.7; // Sports reduce effectiveness
      if (!profile.waterResistant) activityMultiplier *= 0.8; // Non-water-resistant reduce time

      const adjustedMinutes = Math.round(
        baseTime * uvMultiplier * spfMultiplier * activityMultiplier,
      );

      // Minimum 30 minutes, maximum 4 hours
      const finalMinutes = Math.max(30, Math.min(240, adjustedMinutes));

      const reapplicationTime = new Date();
      reapplicationTime.setMinutes(reapplicationTime.getMinutes() + finalMinutes);

      logger.info(
        `⏰ Calculated reapplication time: ${finalMinutes} minutes (base: ${baseTime}, UV: ${uvIndex}, SPF: ${spf})`,
      );

      return reapplicationTime;
    } catch (error) {
      logger.error('Error calculating reapplication time:', error);
      // Fallback to 2 hours
      const fallback = new Date();
      fallback.setHours(fallback.getHours() + 2);
      return fallback;
    }
  }

  // Schedule notification reminder
  private static async scheduleReapplicationReminder(
    application: SunscreenApplication,
  ): Promise<void> {
    try {
      if (Platform.OS === 'web') return;

      const profile = await this.getUserProfile();
      if (!profile.notificationPreferences.enabled) return;

      // Schedule advance warning
      const warningTime = new Date(application.reapplicationDue);
      warningTime.setMinutes(
        warningTime.getMinutes() - profile.notificationPreferences.advanceWarning,
      );

      const reminderId = await NotificationService.scheduleAt(application.reapplicationDue, {
        title: '🧴 Sunscreen Reminder',
        body: `Time to reapply sunscreen! Current UV index: ${application.uvIndex}`,
        data: { applicationId: application.id, type: 'reapplication_reminder' },
        sound: profile.notificationPreferences.soundEnabled,
      });

      // Also schedule advance warning if configured
      let advanceReminderId: string | null = null;
      if (profile.notificationPreferences.advanceWarning > 0 && warningTime > new Date()) {
        advanceReminderId = await NotificationService.scheduleAt(warningTime, {
          title: '🌞 Sunscreen Warning',
          body: `Reapply sunscreen in ${profile.notificationPreferences.advanceWarning} minutes`,
          data: { applicationId: application.id, type: 'advance_warning' },
          sound: false,
        });
      }

      logger.info(`📱 Scheduled reminder for ${application.reapplicationDue.toLocaleTimeString()}`);

      // Save reminder info (main reminder)
      const reminder: SunscreenReminder = {
        id: reminderId,
        applicationId: application.id,
        scheduledTime: application.reapplicationDue,
        title: 'Reapply Sunscreen',
        message: `Time to reapply sunscreen! UV Index: ${application.uvIndex}`,
        isActive: true,
        uvBasedAdjustment: true,
      };

      await this.saveReminder(reminder);

      // Save advance warning reminder if created
      if (advanceReminderId) {
        const advance: SunscreenReminder = {
          id: advanceReminderId,
          applicationId: application.id,
          scheduledTime: warningTime,
          title: 'Sunscreen Warning',
          message: `Reapply sunscreen in ${profile.notificationPreferences.advanceWarning} minutes`,
          isActive: true,
          uvBasedAdjustment: true,
        };
        await this.saveReminder(advance);
      }
    } catch (error) {
      logger.error('Failed to schedule reminder:', error);
    }
  }

  // Get user's sunscreen profile
  static async getUserProfile(): Promise<UserSunscreenProfile> {
    try {
      const profileJson = await AsyncStorage.getItem(this.STORAGE_KEYS.PROFILE);
      if (profileJson) {
        const parsed: UserSunscreenProfile = JSON.parse(profileJson);
        const normalized = {
          ...parsed,
          bodyPartsToTrack: this.normalizeBodyParts(parsed.bodyPartsToTrack),
        };
        // Persist normalization if data changed
        if (
          JSON.stringify(normalized.bodyPartsToTrack) !== JSON.stringify(parsed.bodyPartsToTrack)
        ) {
          try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.PROFILE, JSON.stringify(normalized));
          } catch (e) {
            logger.warn('Failed to persist normalized profile body parts', { error: String(e) });
          }
        }
        return normalized;
      }
    } catch (error) {
      logger.error('Error loading user profile:', error);
    }

    // Return default profile
    return this.getDefaultProfile();
  }

  // Save user profile with validation
  static async saveUserProfile(profile: UserSunscreenProfile): Promise<void> {
    try {
      // Validate profile data before saving
      if (!profile.skinType || !profile.bodyPartsToTrack || profile.bodyPartsToTrack.length === 0) {
        throw new Error('Invalid profile data: missing required fields');
      }

      const profileData = JSON.stringify(profile);
      await AsyncStorage.setItem(this.STORAGE_KEYS.PROFILE, profileData);
      logger.info('User profile saved successfully');
    } catch (error) {
      logger.error(
        'Failed to save user profile',
        error instanceof Error ? error : new Error(String(error)),
      );
      throw new Error('Failed to save profile');
    }
  }

  // Get recent applications
  static async getRecentApplications(limit: number = 10): Promise<SunscreenApplication[]> {
    try {
      const applicationsJson = await AsyncStorage.getItem(this.STORAGE_KEYS.APPLICATIONS);
      if (!applicationsJson) return [];

      const applications: SunscreenApplication[] = JSON.parse(applicationsJson);

      // Parse dates and sort by timestamp (newest first)
      return applications
        .map((app) => ({
          ...app,
          timestamp: new Date(app.timestamp),
          reapplicationDue: new Date(app.reapplicationDue),
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      logger.error('Error loading applications:', error);
      return [];
    }
  }

  // Check if reapplication is due
  static async checkReapplicationStatus(): Promise<{
    isDue: boolean;
    timeRemaining?: number; // minutes
    nextApplication?: SunscreenApplication;
  }> {
    try {
      const applications = await this.getRecentApplications(5);
      if (applications.length === 0) {
        return { isDue: false };
      }

      const mostRecent = applications[0];
      const now = new Date();
      const timeDiff = mostRecent.reapplicationDue.getTime() - now.getTime();
      const minutesRemaining = Math.round(timeDiff / (1000 * 60));

      return {
        isDue: minutesRemaining <= 0,
        timeRemaining: Math.max(0, minutesRemaining),
        nextApplication: mostRecent,
      };
    } catch (error) {
      logger.error('Error checking reapplication status:', error);
      return { isDue: false };
    }
  }

  // Cancel all active reminders for a specific application
  static async cancelReminders(applicationId: string): Promise<void> {
    try {
      if (Platform.OS === 'web') return;

      // Load stored reminders and cancel each scheduled notification by its ID
      const remindersJson = await AsyncStorage.getItem(this.STORAGE_KEYS.REMINDERS);
      const reminders: SunscreenReminder[] = remindersJson ? JSON.parse(remindersJson) : [];

      const toCancel = reminders.filter((r) => r.applicationId === applicationId && r.isActive);
      for (const r of toCancel) {
        try {
          await NotificationService.cancelNotification(r.id);
        } catch (err) {
          logger.warn('Failed to cancel scheduled notification', { id: r.id, err });
        }
      }

      // Mark reminders inactive and persist
      const updated = reminders.map((r) =>
        r.applicationId === applicationId ? { ...r, isActive: false } : r,
      );
      await AsyncStorage.setItem(this.STORAGE_KEYS.REMINDERS, JSON.stringify(updated));

      logger.info('🔕 Cancelled reminders for application:', applicationId);
    } catch (error) {
      logger.error('Failed to cancel reminders:', error);
    }
  }

  private static async saveApplication(application: SunscreenApplication): Promise<void> {
    try {
      const applications = await this.getRecentApplications(50); // Keep last 50
      applications.unshift(application);
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.APPLICATIONS,
        JSON.stringify(applications.slice(0, 50)),
      );
    } catch (error) {
      logger.error('Failed to save application:', error);
      throw error;
    }
  }

  private static async saveReminder(reminder: SunscreenReminder): Promise<void> {
    try {
      const remindersJson = await AsyncStorage.getItem(this.STORAGE_KEYS.REMINDERS);
      const reminders = remindersJson ? JSON.parse(remindersJson) : [];

      reminders.push(reminder);
      await AsyncStorage.setItem(this.STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (error) {
      logger.error('Failed to save reminder:', error);
    }
  }

  private static getDefaultProfile(): UserSunscreenProfile {
    return {
      skinType: SKIN_TYPES[2], // Medium skin type as default
      preferredSPF: 30,
      waterResistant: false,
      sportActivity: false,
      bodyPartsToTrack: ['Face', 'Arms', 'Legs'],
      notificationPreferences: {
        enabled: true,
        advanceWarning: 15, // 15 minutes advance warning
        soundEnabled: true,
        vibrationEnabled: true,
      },
    };
  }

  private static normalizeBodyParts(parts: string[]): string[] {
    const map: Record<string, string> = {
      face: 'Face',
      arms: 'Arms',
      legs: 'Legs',
      torso: 'Torso',
      back: 'Back',
      hands: 'Hands',
      feet: 'Feet',
    };
    return parts.map((p) => map[p.toLowerCase()] ?? p);
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.APPLICATIONS,
        this.STORAGE_KEYS.PROFILE,
        this.STORAGE_KEYS.REMINDERS,
      ]);
      await NotificationService.cancelAll();
      logger.info('🗑️ All sunscreen data cleared');
    } catch (error) {
      logger.error('Failed to clear data:', error);
    }
  }
}
