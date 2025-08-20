import * as Location from 'expo-location';
import { Location as LocationType } from '../types/weather';

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

export class LocationService {
  private static readonly LOCATION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static locationInfoCache: Map<string, { info: LocationInfo; timestamp: number }> = new Map();

  static async getCurrentLocation(): Promise<LocationType> {
    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        maximumAge: 30 * 1000, // 30 seconds
        timeout: 15 * 1000, // 15 seconds timeout
      });

      console.log('📍 Location obtained:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };
    } catch (error) {
      console.error('Failed to get current location:', error);
      
      // Fallback: try to get last known location
      try {
        const lastKnown = await Location.getLastKnownPositionAsync({
          maxAge: 10 * 60 * 1000, // 10 minutes
        });
        
        if (lastKnown) {
          console.log('📍 Using last known location');
          return {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
            accuracy: lastKnown.coords.accuracy || undefined,
          };
        }
      } catch (lastKnownError) {
        console.warn('Failed to get last known location:', lastKnownError);
      }
      
      throw new Error('Unable to obtain location. Please enable location services and try again.');
    }
  }

  static async getDetailedLocationInfo(location: LocationType): Promise<LocationInfo> {
    const cacheKey = `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
    
    // Check cache first
    const cached = this.locationInfoCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.LOCATION_CACHE_DURATION) {
      console.log('📍 Using cached location info for', cacheKey);
      return cached.info;
    }

    try {
      console.log('📍 Reverse geocoding for coordinates:', location.latitude, location.longitude);
      
      const reverseGeocodeResult = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      const address = reverseGeocodeResult[0];
      if (!address) {
        throw new Error('No address found for coordinates');
      }

      console.log('📍 Reverse geocoding result:', address);

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
        timestamp: Date.now()
      });

      console.log('📍 Location info processed:', locationInfo);
      return locationInfo;

    } catch (error) {
      console.error('Detailed reverse geocoding failed:', error);
      
      // Return basic fallback info
      return {
        name: 'Current Location',
        country: 'Unknown',
        formattedAddress: `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`,
      };
    }
  }

  private static getBestCityName(address: any): string {
    // Priority order for city names
    const candidates = [
      address.city,
      address.district, 
      address.subregion,
      address.region,
      address.name,
      address.locality
    ];

    for (const candidate of candidates) {
      if (candidate && typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }

    return 'Unknown Location';
  }

  private static formatAddress(address: any): string {
    const parts = [];
    
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.country) parts.push(address.country);
    if (address.postalCode) parts.push(address.postalCode);
    
    return parts.length > 0 ? parts.join(', ') : 'Address unavailable';
  }

  static clearLocationCache(): void {
    this.locationInfoCache.clear();
    console.log('📍 Location cache cleared');
  }

  static async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.warn('Failed to check location services:', error);
      return false;
    }
  }

  static async getLocationPermissionStatus(): Promise<Location.PermissionStatus> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status;
    } catch (error) {
      console.warn('Failed to get permission status:', error);
      return Location.PermissionStatus.UNDETERMINED;
    }
  }
}