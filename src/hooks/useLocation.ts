/**
 * Custom hook for managing location services
 */

import { useWeather } from '@/src/context/WeatherContext';
import { logger } from '@/src/services/LoggerService';
import { Coordinates, Location as AppLocation } from '@/src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export type LocationErrorCode =
  | 'permission-denied'
  | 'services-disabled'
  | 'timeout'
  | 'unavailable'
  | 'unknown';

export class LocationError extends Error {
  public code: LocationErrorCode;
  public cause?: Error;

  constructor(code: LocationErrorCode, message: string, cause?: Error) {
    super(message);
    this.code = code;
    this.name = 'LocationError';
    this.cause = cause;
  }
}

interface GetCurrentLocationOptions {
  promptForServices?: boolean;
}

const LAST_LOCATION_STORAGE_KEY = '@WeatherSunscreen:lastLocation';

type LocationDetails = Omit<AppLocation, 'coordinates'>;

interface StoredLocation {
  coords: Coordinates;
  details?: LocationDetails | null;
}

interface ApplyLocationOptions {
  force?: boolean;
}

type ApplyLocationFn = (
  coords: Coordinates,
  details?: LocationDetails,
  options?: ApplyLocationOptions
) => Promise<void>;

const LOCATION_DISTANCE_THRESHOLD_METERS = 150; // ~150m; avoids rapid updates when stationary

function toRadians(value: number): number {
  return value * (Math.PI / 180);
}

function calculateDistanceMeters(a: Coordinates, b: Coordinates): number {
  const earthRadius = 6371000; // meters
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);

  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const haversine =
    sinDLat * sinDLat +
    sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return earthRadius * c;
}

function hasSignificantChange(previous: Coordinates | null, next: Coordinates): boolean {
  if (!previous) {
    return true;
  }

  return calculateDistanceMeters(previous, next) >= LOCATION_DISTANCE_THRESHOLD_METERS;
}

export function useLocation() {
  const { currentLocation, currentLocationDetails, setLocation } = useWeather();
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('undetermined');
  const [servicesEnabled, setServicesEnabled] = useState<boolean | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const lastCoordsRef = useRef<Coordinates | null>(currentLocation ?? null);
  const applyLocationRef = useRef<ApplyLocationFn | null>(null);

  const resolveLocationDetails = useCallback(async (
    coords: Coordinates,
  ): Promise<LocationDetails | undefined> => {
    try {
      const results = await Location.reverseGeocodeAsync(coords);
      if (!results || results.length === 0) {
        return undefined;
      }

      const place = results[0];
      const city =
        place.city ??
        place.district ??
        place.subregion ??
        place.region ??
        place.name ??
        undefined;
      const country = place.country ?? undefined;
      const timezone = (place as { timezone?: string }).timezone ?? undefined;

      if (!city && !country && !timezone) {
        return undefined;
      }

      return {
        city,
        country,
        timezone,
      };
    } catch (err) {
      logger.warn('Failed to reverse geocode coordinates', 'LOCATION', {
        coords,
        error: err instanceof Error ? err.message : err,
      });
      return undefined;
    }
  }, []);

  const persistLocation = useCallback(async (coords: Coordinates, details?: LocationDetails) => {
    try {
      const payload: StoredLocation = {
        coords,
        details: details
          ? {
              city: details.city,
              country: details.country,
              timezone: details.timezone,
            }
          : undefined,
      };

      await AsyncStorage.setItem(LAST_LOCATION_STORAGE_KEY, JSON.stringify(payload));
    } catch (storageError) {
      logger.warn('Failed to persist location', 'LOCATION', {
        error: storageError instanceof Error ? storageError.message : storageError,
      });
    }
  }, []);

  const applyLocation = useCallback<ApplyLocationFn>(
    async (
      coords: Coordinates,
      details?: LocationDetails,
      options: ApplyLocationOptions = {}
    ) => {
      const { force = false } = options;

      if (!force && !hasSignificantChange(lastCoordsRef.current, coords)) {
        return;
      }

      let resolvedDetails = details;

      if (!resolvedDetails && currentLocationDetails) {
        const sameAsCurrent =
          currentLocationDetails.coordinates.latitude === coords.latitude &&
          currentLocationDetails.coordinates.longitude === coords.longitude;

        if (sameAsCurrent) {
          resolvedDetails = {
            city: currentLocationDetails.city,
            country: currentLocationDetails.country,
            timezone: currentLocationDetails.timezone,
          };
        }
      }

      if (!resolvedDetails) {
        resolvedDetails = await resolveLocationDetails(coords);
      }

      setLocation(coords, resolvedDetails);
      lastCoordsRef.current = coords;
      await persistLocation(coords, resolvedDetails);

      logger.info('Applied location update', 'LOCATION', {
        coords,
        details: resolvedDetails,
        force,
      });
    },
    [currentLocationDetails, resolveLocationDetails, setLocation, persistLocation]
  );

  useEffect(() => {
    applyLocationRef.current = applyLocation;
  }, [applyLocation]);

  useEffect(() => {
    if (currentLocation) {
      lastCoordsRef.current = currentLocation;
    }
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  const ensureServicesEnabled = useCallback(async (promptUser = false): Promise<boolean> => {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      setServicesEnabled(enabled);

      if (!enabled && promptUser && Platform.OS === 'android') {
        try {
          await Location.enableNetworkProviderAsync();
        } catch (enableError) {
          logger.warn('Failed to prompt for location services', 'LOCATION', {
            error: enableError instanceof Error ? enableError.message : enableError,
          });
        }

        const recheck = await Location.hasServicesEnabledAsync();
        setServicesEnabled(recheck);
        return recheck;
      }

      return enabled;
    } catch (err) {
      logger.error('Failed to verify location services', err as Error, 'LOCATION');
      setServicesEnabled(false);
      return false;
    }
  }, []);

  // Check location permission on mount
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

      await ensureServicesEnabled(false);
    } catch (err) {
      const locationError = new LocationError('unknown', 'Failed to check location permission', err as Error);
      setError(locationError);
      logger.error('Failed to check location permission', err as Error, 'LOCATION');
    }
  }, [ensureServicesEnabled]);

  useEffect(() => {
    void checkPermission();
  }, [checkPermission]);

  // Restore last known stored location if available
  useEffect(() => {
    let isMounted = true;

    if (currentLocation) {
      return;
    }

    const restoreLocation = async () => {
      try {
        const stored = await AsyncStorage.getItem(LAST_LOCATION_STORAGE_KEY);
        if (!stored || !isMounted) return;

        const parsedValue = JSON.parse(stored) as StoredLocation | Coordinates | null;
        let coords: Coordinates | null = null;
        let details: LocationDetails | undefined;

        if (parsedValue && typeof parsedValue === 'object') {
          if ('coords' in parsedValue && parsedValue.coords) {
            const candidate = parsedValue.coords as Coordinates;
            if (
              typeof candidate.latitude === 'number' &&
              typeof candidate.longitude === 'number'
            ) {
              coords = candidate;
              details = parsedValue.details ?? undefined;
            }
          } else if (
            'latitude' in parsedValue &&
            'longitude' in parsedValue &&
            typeof parsedValue.latitude === 'number' &&
            typeof parsedValue.longitude === 'number'
          ) {
            coords = parsedValue as Coordinates;
          }
        }

        if (coords) {
          logger.info('Restoring last known location from storage', 'LOCATION', {
            coords,
            details,
          });
          await applyLocation(coords, details ?? undefined, { force: true });
        }
      } catch (err) {
        logger.warn('Failed to restore stored location', 'LOCATION', {
          error: err instanceof Error ? err.message : err,
        });
      }
    };

    void restoreLocation();

    return () => {
      isMounted = false;
    };
  }, [currentLocation, applyLocation]);

  // Auto-request permission if undetermined
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const normalizedStatus = status as LocationPermissionStatus;
      setPermissionStatus(normalizedStatus);

      if (normalizedStatus === 'granted') {
        logger.info('Location permission granted', 'LOCATION');
        await ensureServicesEnabled(false);
        return true;
      }

      const locationError = new LocationError('permission-denied', 'Location permission denied');
      setError(locationError);
      logger.warn('Location permission denied', 'LOCATION');
      return false;
    } catch (err) {
      const locationError = new LocationError('unknown', 'Failed to request location permission', err as Error);
      setError(locationError);
      logger.error('Failed to request location permission', err as Error, 'LOCATION');
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, [ensureServicesEnabled]);

  useEffect(() => {
    if (permissionStatus === 'undetermined' && !isRequesting) {
      requestPermission().catch(() => {
        // Suppress errors - already handled in requestPermission
      });
    }
  }, [permissionStatus, isRequesting, requestPermission]);

  const getCurrentLocation = useCallback(async (
    options: GetCurrentLocationOptions = {},
  ): Promise<Coordinates> => {
    const { promptForServices = true } = options;

    if (permissionStatus === 'denied') {
      const locationError = new LocationError('permission-denied', 'Location permission denied');
      setError(locationError);
      logger.warn('Cannot get location: permission denied', 'LOCATION');
      throw locationError;
    }

    if (permissionStatus === 'undetermined') {
      const granted = await requestPermission();
      if (!granted) {
        const locationError = new LocationError('permission-denied', 'Location permission denied');
        setError(locationError);
        throw locationError;
      }
    }

    setIsRequesting(true);
    setError(null);

    try {
      const enabled = await ensureServicesEnabled(promptForServices);
      if (!enabled) {
        const locationError = new LocationError('services-disabled', 'Location services are disabled');
        setError(locationError);
        logger.warn('Cannot get location: services disabled', 'LOCATION');
        throw locationError;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Platform.OS === 'android' ? Location.Accuracy.High : Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: promptForServices,
      });

      const coords: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      await applyLocation(coords, undefined, { force: true });
      logger.info('Location obtained', 'LOCATION', { coords });

      return coords;
    } catch (err) {
      logger.error('Failed to get current location', err as Error, 'LOCATION');

      try {
        const fallback = await Location.getLastKnownPositionAsync();
        if (fallback) {
          const coords: Coordinates = {
            latitude: fallback.coords.latitude,
            longitude: fallback.coords.longitude,
          };
          await applyLocation(coords, undefined, { force: true });
          logger.warn('Using last known location fallback', 'LOCATION', { coords });
          setError(null);
          return coords;
        }
      } catch (fallbackError) {
        logger.warn('Failed to obtain last known location', 'LOCATION', {
          error: fallbackError instanceof Error ? fallbackError.message : fallbackError,
        });
      }

      try {
        const stored = await AsyncStorage.getItem(LAST_LOCATION_STORAGE_KEY);
        if (stored) {
          const parsedValue = JSON.parse(stored) as StoredLocation | Coordinates | null;
          let coords: Coordinates | null = null;
          let details: LocationDetails | undefined;

          if (parsedValue && typeof parsedValue === 'object') {
            if ('coords' in parsedValue && parsedValue.coords) {
              const candidate = parsedValue.coords as Coordinates;
              if (
                typeof candidate.latitude === 'number' &&
                typeof candidate.longitude === 'number'
              ) {
                coords = candidate;
                details = parsedValue.details ?? undefined;
              }
            } else if (
              'latitude' in parsedValue &&
              'longitude' in parsedValue &&
              typeof parsedValue.latitude === 'number' &&
              typeof parsedValue.longitude === 'number'
            ) {
              coords = parsedValue as Coordinates;
            }
          }

          if (coords) {
            await applyLocation(coords, details, { force: true });
            logger.warn('Using stored location fallback', 'LOCATION', { coords, details });
            setError(null);
            return coords;
          }
        }
      } catch (storageError) {
        logger.warn('Failed to read stored location fallback', 'LOCATION', {
          error: storageError instanceof Error ? storageError.message : storageError,
        });
      }

      let locationError: LocationError;
      if (err instanceof LocationError) {
        locationError = err;
      } else if (err instanceof Error && err.message?.toLowerCase().includes('timeout')) {
        locationError = new LocationError('timeout', 'Location request timed out', err);
      } else if (err instanceof Error && err.message.includes('E_LOCATION_SETTINGS_UNSATISFIED')) {
        locationError = new LocationError('services-disabled', 'Location services are disabled', err);
      } else {
        locationError = new LocationError('unavailable', 'Unable to determine location', err instanceof Error ? err : undefined);
      }

      setError(locationError);
      throw locationError;
    } finally {
      setIsRequesting(false);
    }
  }, [
    permissionStatus,
    requestPermission,
    ensureServicesEnabled,
    applyLocation,
  ]);

  // Set location manually
  const setManualLocation = useCallback(
    (coords: Coordinates, details?: LocationDetails) => {
      logger.info('Setting manual location', 'LOCATION', { coords, details });
      setError(null);
      void applyLocation(coords, details, { force: true });
    },
    [applyLocation]
  );

  const stopLocationUpdates = useCallback(() => {
    if (watchSubscriptionRef.current) {
      watchSubscriptionRef.current.remove();
      watchSubscriptionRef.current = null;
      setIsWatching(false);
      logger.info('Stopped location watcher', 'LOCATION');
    }
  }, []);

  const startLocationUpdates = useCallback(async () => {
    if (watchSubscriptionRef.current) {
      return;
    }

    const enabled = await ensureServicesEnabled(false);
    if (!enabled) {
      logger.warn('Cannot start location watcher: services disabled', 'LOCATION');
      return;
    }

    try {
      watchSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy:
            Platform.OS === 'android'
              ? Location.Accuracy.Balanced
              : Location.Accuracy.Balanced,
          timeInterval: 60_000,
          distanceInterval: 100,
        },
        location => {
          const coords: Coordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          if (!hasSignificantChange(lastCoordsRef.current, coords)) {
            return;
          }

          const applyFn = applyLocationRef.current;
          if (!applyFn) {
            return;
          }

          void applyFn(coords).catch(err => {
            logger.warn('Failed to apply location from watcher', 'LOCATION', {
              error: err instanceof Error ? err.message : err,
            });
          });
        }
      );

      setIsWatching(true);
      logger.info('Started location watcher', 'LOCATION');
    } catch (err) {
      logger.error('Failed to start location watcher', err as Error, 'LOCATION');
      stopLocationUpdates();
    }
  }, [ensureServicesEnabled, stopLocationUpdates]);

  // Sync watcher lifecycle with permission status
  useEffect(() => {
    if (permissionStatus === 'granted') {
      startLocationUpdates().catch(err => {
        logger.warn('Automatic location watcher start failed', 'LOCATION', {
          error: err instanceof Error ? err.message : err,
        });
      });

      return () => {
        stopLocationUpdates();
      };
    }

    stopLocationUpdates();
    return undefined;
  }, [permissionStatus, startLocationUpdates, stopLocationUpdates]);

  // Auto-request location on mount if permission is granted
  useEffect(() => {
    if (permissionStatus === 'granted' && !currentLocation && !isRequesting) {
      getCurrentLocation({ promptForServices: false }).catch(err => {
        if (err instanceof LocationError) {
          logger.warn('Automatic location fetch failed', 'LOCATION', {
            code: err.code,
            message: err.message,
          });
        } else {
          logger.warn('Automatic location fetch failed', 'LOCATION');
        }
      });
    }
  }, [permissionStatus, currentLocation, isRequesting, getCurrentLocation]);

  return {
    // Current state
    currentLocation,
    locationDetails: currentLocationDetails,
    permissionStatus,
    servicesEnabled,
    isRequesting,
    isWatching,
    error,
    hasLocation: !!currentLocation,

    // Actions
    requestPermission,
    getCurrentLocation,
    setManualLocation,
    checkPermission,
    startLocationUpdates,
    stopLocationUpdates,
  };
}

