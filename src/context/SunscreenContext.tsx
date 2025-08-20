import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  SunscreenApplication, 
  UserSunscreenProfile, 
  SkinType, 
  SKIN_TYPES 
} from '../types/sunscreen';
import { SunscreenService } from '../services/sunscreenService';

interface SunscreenState {
  applications: SunscreenApplication[];
  userProfile: UserSunscreenProfile | null;
  isLoading: boolean;
  error: string | null;
  reapplicationStatus: {
    isDue: boolean;
    timeRemaining?: number;
    nextApplication?: SunscreenApplication;
  };
}

interface SunscreenContextType extends SunscreenState {
  logApplication: (spf: number, bodyParts: string[], notes?: string) => Promise<void>;
  updateUserProfile: (profile: UserSunscreenProfile) => Promise<void>;
  loadRecentApplications: () => Promise<void>;
  checkReapplicationStatus: () => Promise<void>;
  cancelReminders: (applicationId: string) => Promise<void>;
  clearError: () => void;
  initializeNotifications: () => Promise<boolean>;
}

const SunscreenContext = createContext<SunscreenContextType | undefined>(undefined);

interface SunscreenProviderProps {
  children: ReactNode;
}

export function SunscreenProvider({ children }: SunscreenProviderProps) {
  const [state, setState] = useState<SunscreenState>({
    applications: [],
    userProfile: null,
    isLoading: false,
    error: null,
    reapplicationStatus: { isDue: false },
  });

  // Initialize notifications and load data on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        
        // Initialize notifications
        await SunscreenService.initializeNotifications();
        
        // Load user profile
        const profile = await SunscreenService.getUserProfile();
        
        // Load recent applications
        const applications = await SunscreenService.getRecentApplications(10);
        
        // Check reapplication status
        const status = await SunscreenService.checkReapplicationStatus();
        
        setState(prev => ({
          ...prev,
          userProfile: profile,
          applications,
          reapplicationStatus: status,
          isLoading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to initialize sunscreen tracking',
          isLoading: false,
        }));
      }
    };

    initialize();
  }, []);

  // Set up interval to check reapplication status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await SunscreenService.checkReapplicationStatus();
        setState(prev => ({
          ...prev,
          reapplicationStatus: status,
        }));
      } catch (error) {
        console.error('Error checking reapplication status:', error);
      }
    };

    // Check immediately and then every minute
    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const logApplication = useCallback(async (spf: number, bodyParts: string[], notes?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const application = await SunscreenService.logSunscreenApplication(spf, bodyParts, notes);
      
      setState(prev => ({
        ...prev,
        applications: [application, ...prev.applications].slice(0, 10), // Keep latest 10
        isLoading: false,
      }));

      // Refresh reapplication status
      await checkReapplicationStatus();
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to log sunscreen application',
      }));
    }
  }, []);

  const updateUserProfile = useCallback(async (profile: UserSunscreenProfile) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await SunscreenService.saveUserProfile(profile);
      
      setState(prev => ({
        ...prev,
        userProfile: profile,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      }));
    }
  }, []);

  const loadRecentApplications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const applications = await SunscreenService.getRecentApplications(10);
      
      setState(prev => ({
        ...prev,
        applications,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load applications',
      }));
    }
  }, []);

  const checkReapplicationStatus = useCallback(async () => {
    try {
      const status = await SunscreenService.checkReapplicationStatus();
      
      setState(prev => ({
        ...prev,
        reapplicationStatus: status,
      }));
    } catch (error) {
      console.error('Error checking reapplication status:', error);
    }
  }, []);

  const cancelReminders = useCallback(async (applicationId: string) => {
    try {
      await SunscreenService.cancelReminders(applicationId);
      console.log('Cancelled reminders for application:', applicationId);
    } catch (error) {
      console.error('Error cancelling reminders:', error);
    }
  }, []);

  const initializeNotifications = useCallback(async (): Promise<boolean> => {
    return await SunscreenService.initializeNotifications();
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const contextValue: SunscreenContextType = {
    ...state,
    logApplication,
    updateUserProfile,
    loadRecentApplications,
    checkReapplicationStatus,
    cancelReminders,
    clearError,
    initializeNotifications,
  };

  return (
    <SunscreenContext.Provider value={contextValue}>
      {children}
    </SunscreenContext.Provider>
  );
}

export function useSunscreen(): SunscreenContextType {
  const context = useContext(SunscreenContext);
  if (!context) {
    throw new Error('useSunscreen must be used within a SunscreenProvider');
  }
  return context;
}