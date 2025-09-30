#import <React/RCTBridgeModule.h>

// Export exactly one module implementation per architecture to avoid selector/signature conflicts.
// When New Architecture is enabled (RCT_NEW_ARCH_ENABLED=1), only the TurboModule is exported.
// On the legacy architecture, only the classic RCTBridge module is exported.

#if !RCT_NEW_ARCH_ENABLED
// Legacy Bridge Module (for backward compatibility on old architecture)
@interface RCT_EXTERN_MODULE(WeatherNativeModule, NSObject)

RCT_EXTERN_METHOD(isAvailable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCurrentLocation:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getUVIndexData:(double)latitude
                  longitude:(double)longitude
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getWeatherData:(double)latitude
                  longitude:(double)longitude
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

@end
#endif

// TurboModule Implementation (New Architecture)
#if RCT_NEW_ARCH_ENABLED
@interface RCT_EXTERN_MODULE(WeatherNativeTurboModule, NSObject)

RCT_EXTERN_METHOD(isAvailable:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCurrentLocation:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getUVIndexData:(double)latitude
                  longitude:(double)longitude
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getWeatherData:(double)latitude
                  longitude:(double)longitude
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

@end
#endif
