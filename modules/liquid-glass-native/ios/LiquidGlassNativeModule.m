#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(LiquidGlassNativeModule, RCTEventEmitter)

RCT_EXTERN_METHOD(createLiquidGlassView:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(updateGlassIntensity:(NSNumber *)viewId
                  intensity:(NSNumber *)intensity
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(triggerHapticFeedback:(NSString *)type)

RCT_EXTERN_METHOD(startMotionTracking)
RCT_EXTERN_METHOD(stopMotionTracking)

@end