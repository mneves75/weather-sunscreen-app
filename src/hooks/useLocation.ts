/**
 * Custom hook for managing location services
 */

import { useWeather } from '@/src/context/WeatherContext';
import { logger } from '@/src/services/LoggerService';
import { Coordinates } from '@/src/types';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export function useLocation() {
  const { currentLocation, setLocation } = useWeather();
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('undetermined');
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Check location permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Auto-request permission if undetermined
  useEffect(() => {
    if (permissionStatus === 'undetermined' && !isRequesting) {
      requestPermission().catch(() => {
        // Silently handle permission request failures
      });
    }
  }, [permissionStatus, isRequesting]);
  
  // Check current permission status
  const checkPermission = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setPermissionStatus('granted');
      } else if (status === 'denied') {
        setPermissionStatus('denied');
      } else {
        setPermissionStatus('undetermined');
      }
    } catch (err) {
      logger.error('Failed to check location permission', err as Error, 'LOCATION');
      setError(err as Error);
    }
  }, []);
  
  // Request location permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    setError(null);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setPermissionStatus('granted');
        logger.info('Location permission granted', 'LOCATION');
        return true;
      } else {
        setPermissionStatus('denied');
        logger.warn('Location permission denied', 'LOCATION');
        return false;
      }
    } catch (err) {
      logger.error('Failed to request location permission', err as Error, 'LOCATION');
      setError(err as Error);
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, []);
  
  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    // Check permission first
    if (permissionStatus === 'denied') {
      logger.warn('Cannot get location: permission denied', 'LOCATION');
      return null;
    }
    
    if (permissionStatus === 'undetermined') {
      const granted = await requestPermission();
      if (!granted) return null;
    }
    
    setIsRequesting(true);
    setError(null);
    
    try {
      logger.info('Getting current location', 'LOCATION');
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const coords: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      logger.info('Location obtained', 'LOCATION', { coords });
      setLocation(coords);
      
      return coords;
    } catch (err) {
      logger.error('Failed to get current location', err as Error, 'LOCATION');
      setError(err as Error);
      return null;
    } finally {
      setIsRequesting(false);
    }
  }, [permissionStatus, requestPermission, setLocation]);
  
  // Set location manually
  const setManualLocation = useCallback((coords: Coordinates) => {
    logger.info('Setting manual location', 'LOCATION', { coords });
    setLocation(coords);
    setError(null);
  }, [setLocation]);
  
  // Auto-request location on mount if permission is granted
  useEffect(() => {
    if (permissionStatus === 'granted' && !currentLocation && !isRequesting) {
      // Use the function directly without adding it to dependencies
      // to avoid circular dependency issues
      const getLocation = async () => {
        try {
          setIsRequesting(true);
          setError(null);

          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          const coords: Coordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          logger.info('Location obtained', 'LOCATION', { coords });
          setLocation(coords);
        } catch (err) {
          logger.error('Failed to get current location', err as Error, 'LOCATION');
          setError(err as Error);
        } finally {
          setIsRequesting(false);
        }
      };

      getLocation();
    }
  }, [permissionStatus, currentLocation, isRequesting, setLocation]);
  
  return {
    // Current state
    currentLocation,
    permissionStatus,
    isRequesting,
    error,
    hasLocation: !!currentLocation,
    
    // Actions
    requestPermission,
    getCurrentLocation,
    setManualLocation,
    checkPermission,
  };
}

