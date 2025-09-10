import { Location as LocationType } from '../types/weather';
import i18next from 'i18next';
import { logger } from './loggerService';

// Safe import of expo-location with fallback
type ExpoLocationLike = {
  requestForegroundPermissionsAsync: () => Promise<{ status: string }>;
  getCurrentPositionAsync: (opts: {
    accuracy?: number;
    maximumAge?: number;
    timeout?: number;
  }) => Promise<{ coords: { latitude: number; longitude: number; accuracy?: number } }>;
  getLastKnownPositionAsync: (opts: {
    maxAge?: number;
  }) => Promise<{ coords: { latitude: number; longitude: number; accuracy?: number } } | null>;
  hasServicesEnabledAsync: () => Promise<boolean>;
  reverseGeocodeAsync: (coords: {
    latitude: number;
    longitude: number;
  }) => Promise<Array<Record<string, unknown>>>;
  Accuracy: { BestForNavigation: number };
  getForegroundPermissionsAsync: () => Promise<{ status: string }>;
};
let Location: ExpoLocationLike | null = null;
try {
  Location = require('expo-location');
  logger.info('✅ ExpoLocation native module loaded successfully');
} catch (error) {
  logger.warn('⚠️ ExpoLocation native module not available', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  logger.info('📱 Using fallback location service for development');
}

export interface LocationInfo {
  name: string;
  country: string;
  region?: string;
  district?: string;
  isoCountryCode?: string;
  postalCode?: string;
  street?: string;
  formattedAddress: string;
}

type AddressLike = {
  city?: string;
  district?: string;
  subregion?: string;
  region?: string;
  name?: string;
  locality?: string;
  street?: string;
  country?: string;
  isoCountryCode?: string;
  postalCode?: string;
};

export class LocationService {
  private static readonly LOCATION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static locationInfoCache: Map<string, { info: LocationInfo; timestamp: number }> =
    new Map();

  static async getCurrentLocation(): Promise<LocationType> {
    // Check if native location module is available
    if (!Location) {
      logger.info('📍 Using fallback location (San Francisco) - native module not available');
      return this.getFallbackLocation();
    }

    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        logger.info('📍 Location permission denied, using fallback');
        return this.getFallbackLocation();
      }

      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        maximumAge: 30 * 1000, // 30 seconds
        timeout: 15 * 1000, // 15 seconds timeout
      });

      logger.info('📍 Location obtained:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };
    } catch (error) {
      logger.error(
        'Failed to get current location',
        error instanceof Error ? error : new Error(String(error)),
      );

      // Fallback: try to get last known location
      try {
        const lastKnown = await Location.getLastKnownPositionAsync({
          maxAge: 10 * 60 * 1000, // 10 minutes
        });

        if (lastKnown) {
          logger.info('📍 Using last known location');
          return {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
            accuracy: lastKnown.coords.accuracy || undefined,
          };
        }
      } catch (lastKnownError) {
        logger.warn('Failed to get last known location', {
          error: lastKnownError instanceof Error ? lastKnownError.message : String(lastKnownError),
        });
      }

      logger.info('📍 All location methods failed, using fallback');
      return this.getFallbackLocation();
    }
  }

  static async getDetailedLocationInfo(location: LocationType): Promise<LocationInfo> {
    const cacheKey = `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;

    // Check cache first
    const cached = this.locationInfoCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.LOCATION_CACHE_DURATION) {
      logger.info('📍 Using cached location info', { cacheKey });
      return cached.info;
    }

    // If Location module not available, return mock info
    if (!Location) {
      return this.getFallbackLocationInfo(location);
    }

    try {
      logger.info('📍 Reverse geocoding for coordinates', {
        latitude: location.latitude,
        longitude: location.longitude,
      });

      const reverseGeocodeResult = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      const address = reverseGeocodeResult[0] as AddressLike | undefined;
      if (!address) {
        throw new Error('No address found for coordinates');
      }

      logger.info('📍 Reverse geocoding result', address as Record<string, unknown>);

      // Build comprehensive location info
      const locationInfo: LocationInfo = {
        name: this.getBestCityName(address),
        country: address.country || address.isoCountryCode || 'Unknown',
        region: address.region || address.subregion || undefined,
        district: address.district || undefined,
        isoCountryCode: address.isoCountryCode || undefined,
        postalCode: address.postalCode || undefined,
        street: address.street || undefined,
        formattedAddress: this.formatAddress(address),
      };

      // Cache the result
      this.locationInfoCache.set(cacheKey, {
        info: locationInfo,
        timestamp: Date.now(),
      });

      logger.info(
        '📍 Location info processed:',
        locationInfo as unknown as Record<string, unknown>,
      );
      return locationInfo;
    } catch (error) {
      logger.error(
        'Detailed reverse geocoding failed',
        error instanceof Error ? error : new Error(String(error)),
      );

      // Return fallback info
      return this.getFallbackLocationInfo(location);
    }
  }

  private static getBestCityName(address: AddressLike): string {
    // Priority order for city names
    const candidates = [
      address.city,
      address.district,
      address.subregion,
      address.region,
      address.name,
      address.locality,
    ];

    for (const candidate of candidates) {
      if (candidate && typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }

    return i18next.t('location.unknown');
  }

  private static formatAddress(address: AddressLike): string {
    const parts = [];

    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.country) parts.push(address.country);
    if (address.postalCode) parts.push(address.postalCode);

    return parts.length > 0 ? parts.join(', ') : i18next.t('location.addressUnavailable');
  }

  static clearLocationCache(): void {
    this.locationInfoCache.clear();
    logger.info('📍 Location cache cleared');
  }

  private static getFallbackLocation(): LocationType {
    // San Francisco coordinates for development fallback
    return {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: undefined,
    };
  }

  private static getFallbackLocationInfo(location: LocationType): LocationInfo {
    // Provide basic mock location info based on coordinates
    let name = 'Development Location';
    let country = 'Unknown';

    // Simple coordinate-based location detection for common cities
    if (
      Math.abs(location.latitude - 37.7749) < 0.1 &&
      Math.abs(location.longitude - -122.4194) < 0.1
    ) {
      name = 'San Francisco';
      country = 'United States';
    } else if (
      Math.abs(location.latitude - 40.7128) < 0.1 &&
      Math.abs(location.longitude - -74.006) < 0.1
    ) {
      name = 'New York';
      country = 'United States';
    }

    return {
      name,
      country,
      formattedAddress: `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`,
    };
  }

  static async isLocationEnabled(): Promise<boolean> {
    if (!Location) {
      logger.info('📍 Location services check: native module not available');
      return false;
    }

    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      logger.warn('Failed to check location services', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  static async getLocationPermissionStatus(): Promise<string> {
    if (!Location) {
      logger.info('📍 Permission status check: native module not available');
      return 'unavailable';
    }

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status;
    } catch (error) {
      logger.warn('Failed to get permission status', {
        error: error instanceof Error ? error.message : String(error),
      });
      return 'undetermined';
    }
  }
}
