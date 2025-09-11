import Foundation
import UIKit
import React

@objc(LiquidGlassNativeTurboModule)
class LiquidGlassNativeTurboModule: NSObject, RCTTurboModule {
    
    // Reference to the existing legacy module to reuse implementation
    private let legacyModule: LiquidGlassNativeModule
    
    override init() {
        self.legacyModule = LiquidGlassNativeModule()
        super.init()
    }
    
    // MARK: - TurboModule Protocol
    
    static func moduleName() -> String! {
        return "LiquidGlassNativeModule"
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    // MARK: - Bridged API (TurboModule)
    
    @objc
    func isAvailable(_ resolve: @escaping RCTPromiseResolveBlock,
                     reject: @escaping RCTPromiseRejectBlock) {
        // Dev/test feature flag: allow forcing availability for pre‑iOS 26 validation
        let env = ProcessInfo.processInfo.environment
        let forceEnable = env["LIQUID_GLASS_FORCE_ENABLE"] == "1" || UserDefaults.standard.bool(forKey: "LIQUID_GLASS_FORCE_ENABLE")

        if forceEnable {
            resolve(true)
            return
        }

        // Check if iOS 26 Liquid Glass is available
        let isIOS26Available = NSClassFromString("UILiquidGlassMaterial") != nil
        let systemVersion = ProcessInfo.processInfo.operatingSystemVersion
        let platformVersion = Float(systemVersion.majorVersion)

        let available = isIOS26Available && platformVersion >= 26.0
        resolve(available)
    }
    
    @objc
    func getConstants() -> [String: Any] {
        return legacyModule.constantsToExport()
    }
    
    @objc
    func createLiquidGlassView(_ config: [String: Any],
                               resolver: @escaping RCTPromiseResolveBlock,
                               rejecter: @escaping RCTPromiseRejectBlock) {
        // Delegate to legacy module with proper error handling
        legacyModule.createLiquidGlassView(
            config as NSDictionary,
            resolver: resolver,
            rejecter: rejecter
        )
    }
    
    @objc
    func updateGlassIntensity(_ viewId: NSNumber,
                              intensity: NSNumber,
                              resolver: @escaping RCTPromiseResolveBlock,
                              rejecter: @escaping RCTPromiseRejectBlock) {
        // Validate input parameters
        guard viewId.intValue > 0 else {
            rejecter("INVALID_VIEW_ID", "View ID must be greater than 0", nil)
            return
        }
        
        guard intensity.floatValue >= 0.0 && intensity.floatValue <= 100.0 else {
            rejecter("INVALID_INTENSITY", "Intensity must be between 0.0 and 100.0", nil)
            return
        }
        
        // Delegate to legacy module
        legacyModule.updateGlassIntensity(
            viewId,
            intensity: intensity,
            resolver: resolver,
            rejecter: rejecter
        )
    }
    
    @objc
    func triggerHapticFeedback(_ type: String) {
        // Validate haptic type
        let validTypes = ["light", "medium", "heavy", "selection"]
        guard validTypes.contains(type.lowercased()) else {
            print("Invalid haptic feedback type: \(type). Valid types: \(validTypes)")
            return
        }
        
        legacyModule.triggerHapticFeedback(type as NSString)
    }
    
    @objc
    func startMotionTracking() {
        legacyModule.startMotionTracking()
    }
    
    @objc
    func stopMotionTracking() {
        legacyModule.stopMotionTracking()
    }
    
    @objc
    func addListener(_ eventName: String) {
        // Validate event name
        guard !eventName.isEmpty else {
            print("Event name cannot be empty")
            return
        }
        
        legacyModule.addListener(eventName)
    }
    
    @objc
    func removeListeners(_ count: NSNumber) {
        // Validate count
        guard count.intValue >= 0 else {
            print("Listener count cannot be negative")
            return
        }
        
        legacyModule.removeListeners(count)
    }
}
