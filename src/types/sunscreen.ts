export interface SunscreenApplication {
  id: string;
  timestamp: Date;
  spf: number;
  uvIndex: number;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  reapplicationDue: Date;
  bodyParts: string[];
  notes?: string;
}

export interface SunscreenReminder {
  id: string;
  applicationId: string;
  scheduledTime: Date;
  title: string;
  message: string;
  isActive: boolean;
  uvBasedAdjustment: boolean;
}

export interface SkinType {
  type: 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  description: string;
  baseReapplicationTime: number; // minutes
  spfRecommendation: number;
}

export const SKIN_TYPES: SkinType[] = [
  {
    type: 1,
    name: 'Very Fair',
    description: 'Always burns, never tans',
    baseReapplicationTime: 60, // 1 hour
    spfRecommendation: 50,
  },
  {
    type: 2,
    name: 'Fair',
    description: 'Usually burns, tans minimally',
    baseReapplicationTime: 90, // 1.5 hours
    spfRecommendation: 30,
  },
  {
    type: 3,
    name: 'Medium',
    description: 'Sometimes burns, tans gradually',
    baseReapplicationTime: 120, // 2 hours
    spfRecommendation: 30,
  },
  {
    type: 4,
    name: 'Olive',
    description: 'Rarely burns, tans well',
    baseReapplicationTime: 150, // 2.5 hours
    spfRecommendation: 15,
  },
  {
    type: 5,
    name: 'Dark',
    description: 'Very rarely burns, tans very easily',
    baseReapplicationTime: 180, // 3 hours
    spfRecommendation: 15,
  },
  {
    type: 6,
    name: 'Very Dark',
    description: 'Never burns, deeply pigmented',
    baseReapplicationTime: 210, // 3.5 hours
    spfRecommendation: 15,
  },
];

export interface UserSunscreenProfile {
  skinType: SkinType;
  preferredSPF: number;
  waterResistant: boolean;
  sportActivity: boolean;
  customReapplicationTime?: number; // Override default based on skin type
  bodyPartsToTrack: string[];
  notificationPreferences: {
    enabled: boolean;
    advanceWarning: number; // minutes before reapplication
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
}