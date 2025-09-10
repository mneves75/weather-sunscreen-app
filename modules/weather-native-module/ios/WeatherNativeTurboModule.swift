import Foundation
import React
import CoreLocation
import WeatherKit

/**
 * TurboModule implementation for WeatherNativeModule
 * This class bridges the existing WeatherNativeModule functionality to the New Architecture
 */
@objc(WeatherNativeTurboModule)
class WeatherNativeTurboModule: NSObject {
    
    // Reference to the existing legacy module for actual implementation
    private let legacyModule = WeatherNativeModule()
    
    // MARK: - TurboModule Protocol Implementation
    
    @objc
    static func moduleName() -> String {
        return "WeatherNativeModule"
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    // MARK: - TurboModule Methods
    
    @objc
    func isAvailable(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        legacyModule.isAvailable(resolver: resolve, rejecter: reject)
    }
    
    @objc
    func getCurrentLocation(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        legacyModule.getCurrentLocation(resolver: resolve, rejecter: reject)
    }
    
    @objc
    func getUVIndexData(
        _ latitude: Double,
        longitude: Double,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        legacyModule.getUVIndexData(
            latitude: latitude,
            longitude: longitude,
            resolver: resolve,
            rejecter: reject
        )
    }
    
    @objc
    func getWeatherData(
        _ latitude: Double,
        longitude: Double,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        legacyModule.getWeatherData(
            latitude: latitude,
            longitude: longitude,
            resolver: resolve,
            rejecter: reject
        )
    }
}

// MARK: - TurboModule Registration

extension WeatherNativeTurboModule: RCTTurboModule {
    // This extension provides the RCTTurboModule protocol conformance
    // The actual TurboModule registration happens through the generated code
}