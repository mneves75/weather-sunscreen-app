import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { SunscreenService } from '../sunscreenService';
import { WeatherService } from '../weatherService';
import { LocationService } from '../locationService';

// Mock platform as iOS to enable notifications path
Object.defineProperty(Platform, 'OS', { value: 'ios' });

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(async () => `notif_${Math.random().toString(36).slice(2)}`),
  cancelScheduledNotificationAsync: jest.fn(async (_id: string) => {}),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => {}),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

// Stub heavy service calls used by logSunscreenApplication
jest.spyOn(LocationService, 'getCurrentLocation').mockResolvedValue({
  latitude: 37.7749,
  longitude: -122.4194,
});
jest.spyOn(LocationService, 'getDetailedLocationInfo').mockResolvedValue({
  name: 'San Francisco',
  country: 'United States',
  formattedAddress: 'San Francisco, United States',
});
jest.spyOn(WeatherService, 'getCurrentWeatherData').mockResolvedValue({
  location: { name: 'San Francisco', country: 'US', lat: 37.7749, lon: -122.4194 },
  current: {
    temperature: 25,
    description: 'Clear',
    icon: 'sun',
    humidity: 40,
    windSpeed: 3,
    pressure: 1013,
    visibility: 10,
    feelsLike: 26,
  },
  forecast: [],
  uvIndex: {
    value: 7,
    level: 'High',
    maxToday: 9,
    peakTime: '12:00 PM',
    sunscreenRecommendation: {
      spf: 30,
      applicationFrequency: 'Every 2 hours',
      additionalTips: [],
      skinTypeRecommendations: {},
    },
  },
});

const REMINDERS_KEY = '@sunscreen_reminders';

describe('SunscreenService notifications', () => {
  beforeEach(async () => {
    await SunscreenService.clearAllData();
    jest.clearAllMocks();
  });

  it('schedules due and advance notifications and persists both reminders', async () => {
    // Make scheduleNotificationAsync return deterministic IDs
    const scheduleSpy = jest
      .spyOn(Notifications, 'scheduleNotificationAsync')
      .mockResolvedValueOnce('reminder-main')
      .mockResolvedValueOnce('reminder-advance');

    // Ensure default profile enables advance warning
    await SunscreenService.saveUserProfile({
      skinType: {
        type: 3,
        name: 'Medium',
        description: '',
        baseReapplicationTime: 120,
        spfRecommendation: 30,
      },
      preferredSPF: 30,
      waterResistant: true,
      sportActivity: false,
      bodyPartsToTrack: ['face'],
      notificationPreferences: {
        enabled: true,
        advanceWarning: 10,
        soundEnabled: true,
        vibrationEnabled: true,
      },
    });

    const app = await SunscreenService.logSunscreenApplication(30, ['face']);
    expect(app).toBeTruthy();

    // Two notifications: main due + advance warning
    expect(scheduleSpy).toHaveBeenCalledTimes(2);

    const remindersRaw = await AsyncStorage.getItem(REMINDERS_KEY);
    const reminders = remindersRaw ? JSON.parse(remindersRaw) : [];
    const ids = reminders.map((r: any) => r.id);
    expect(ids).toEqual(expect.arrayContaining(['reminder-main', 'reminder-advance']));
  });

  it('cancels reminders using scheduled notification IDs, not applicationId', async () => {
    // Seed storage with two reminders for the same application
    const applicationId = 'app_123';
    const seeded = [
      {
        id: 'notif_A',
        applicationId,
        scheduledTime: new Date().toISOString(),
        title: 't',
        message: 'm',
        isActive: true,
        uvBasedAdjustment: true,
      },
      {
        id: 'notif_B',
        applicationId,
        scheduledTime: new Date().toISOString(),
        title: 't',
        message: 'm',
        isActive: true,
        uvBasedAdjustment: true,
      },
    ];
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(seeded));

    const cancelSpy = jest.spyOn(Notifications, 'cancelScheduledNotificationAsync');

    await SunscreenService.cancelReminders(applicationId);

    // Expect to cancel each reminder by its own ID (not the applicationId)
    expect(cancelSpy).toHaveBeenCalledWith('notif_A');
    expect(cancelSpy).toHaveBeenCalledWith('notif_B');
  });
});

describe('SunscreenService profile validation', () => {
  it('rejects saving invalid profile with empty bodyPartsToTrack', async () => {
    await expect(
      SunscreenService.saveUserProfile({
        skinType: {
          type: 3,
          name: 'Medium',
          description: '',
          baseReapplicationTime: 120,
          spfRecommendation: 30,
        },
        preferredSPF: 30,
        waterResistant: false,
        sportActivity: false,
        bodyPartsToTrack: [],
        notificationPreferences: {
          enabled: true,
          advanceWarning: 15,
          soundEnabled: true,
          vibrationEnabled: true,
        },
      }),
    ).rejects.toThrow('Failed to save profile');
  });

  it('normalizes stored bodyParts casing to Title Case on load', async () => {
    const stored = {
      skinType: {
        type: 3,
        name: 'Medium',
        description: '',
        baseReapplicationTime: 120,
        spfRecommendation: 30,
      },
      preferredSPF: 30,
      waterResistant: false,
      sportActivity: false,
      bodyPartsToTrack: ['face', 'arms', 'legs'],
      notificationPreferences: {
        enabled: true,
        advanceWarning: 15,
        soundEnabled: true,
        vibrationEnabled: true,
      },
    };
    await AsyncStorage.setItem('@sunscreen_profile', JSON.stringify(stored));
    const loaded = await SunscreenService.getUserProfile();
    expect(loaded.bodyPartsToTrack).toEqual(['Face', 'Arms', 'Legs']);
  });
});
