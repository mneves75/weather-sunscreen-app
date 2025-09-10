import { NativeModules, Platform } from 'react-native';
import { WeatherNativeService } from '../index';

// Ensure platform is not web
beforeEach(() => {
  Platform.OS = 'ios';
  (WeatherNativeService as any)._resetModuleCache?.();
  NativeModules.WeatherNativeModule = {
    isAvailable: jest.fn(),
    getUVIndexData: jest.fn(),
  } as any;
});

describe('UV data shape', () => {
  const latitude = 37.7749;
  const longitude = -122.4194;

  it('does not include isFallback for fallback result', async () => {
    (NativeModules.WeatherNativeModule!.isAvailable as jest.Mock).mockResolvedValue(false);
    const result = await WeatherNativeService.getUVIndexData(latitude, longitude);
    expect('isFallback' in (result as any)).toBe(false);
  });

  it('does not include isFallback for native result', async () => {
    (NativeModules.WeatherNativeModule!.isAvailable as jest.Mock).mockResolvedValue(true);
    (NativeModules.WeatherNativeModule!.getUVIndexData as jest.Mock).mockResolvedValue({
      uvIndex: 8,
      maxUVToday: 10,
      peakTime: '1:00 PM',
    });
    const result = await WeatherNativeService.getUVIndexData(latitude, longitude);
    expect('isFallback' in (result as any)).toBe(false);
  });
});
