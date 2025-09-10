import Foundation
import UIKit
import CoreMotion
import CoreHaptics
import React

@objc(LiquidGlassNativeModule)
class LiquidGlassNativeModule: RCTEventEmitter {
    private let motionManager = CMMotionManager()
    private var hapticEngine: CHHapticEngine?
    private var resourceManager: LiquidGlassResourceManager?

    override init() {
        super.init()
        
        // Initialize resource manager for proper memory management
        resourceManager = LiquidGlassResourceManager(moduleTarget: self)
        
        setupHapticEngine()
        // Throttle motion updates to save battery (PERF-001)
        motionManager.deviceMotionUpdateInterval = 0.1 // 10Hz instead of 60Hz
    }

    // MARK: - RCTEventEmitter
    override func supportedEvents() -> [String]! {
        ["DeviceMotion"]
    }

    // MARK: - Liquid Glass View Creation
    @objc
    func createLiquidGlassView(_ config: NSDictionary,
                               resolver: @escaping RCTPromiseResolveBlock,
                               rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            let variant = config["variant"] as? String ?? "regular"
            let intensity = (config["intensity"] as? NSNumber)?.doubleValue ?? 80.0
            let dynamicBlur = (config["dynamicBlur"] as? NSNumber)?.boolValue ?? true

            let glassView = self.createIOS26LiquidGlassView(
                variant: variant,
                intensity: CGFloat(intensity),
                dynamicBlur: dynamicBlur
            )

            resolver(["viewId": glassView.hash, "success": true])
        }
    }

    // MARK: - iOS 26 Liquid Glass Implementation (runtime-gated)
    private func createIOS26LiquidGlassView(variant: String,
                                            intensity: CGFloat,
                                            dynamicBlur: Bool) -> UIView {
        let glassView = UIView()
        glassView.clipsToBounds = true

        if let cls = NSClassFromString("UILiquidGlassMaterial") as? NSObject.Type,
           let effect = cls.init() as? UIVisualEffect {
            let effectView = UIVisualEffectView(effect: effect)
            effectView.frame = glassView.bounds
            effectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            if dynamicBlur {
                addDynamicBlurEffect(to: effectView, intensity: intensity)
            }
            let liquidLayer = createLiquidAnimationLayer()
            liquidLayer.frame = glassView.bounds
            effectView.layer.addSublayer(liquidLayer)
            glassView.addSubview(effectView)
            addParallaxEffect(to: glassView)
            addHapticInteraction(to: glassView)
            return glassView
        }

        // Fallback: standard blur
        let blurEffect = UIBlurEffect(style: .systemMaterial)
        let blurView = UIVisualEffectView(effect: blurEffect)
        blurView.frame = glassView.bounds
        blurView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        glassView.addSubview(blurView)
        return glassView
    }

    // MARK: - Dynamic Blur Effect
    private func addDynamicBlurEffect(to view: UIVisualEffectView, intensity: CGFloat) {
        let viewId = view.hash
        
        // Use resource manager for proper memory management
        guard let proxy = resourceManager?.createDisplayLink(for: viewId) else {
            return
        }
        
        // Start the display link
        proxy.start()
        
        // Set up view observation for automatic cleanup
        resourceManager?.observeView(view, viewId: viewId)
        
        // Animate the blur effect
        UIView.animate(withDuration: 3.0, delay: 0, options: [.repeat, .autoreverse, .curveEaseInOut]) {
            view.alpha = 0.8 + (intensity / 500.0)
        }
    }

    @objc private func updateBlur() {
        // Intentionally empty — alpha animation simulates intensity over time
    }
    
    // Clean up all resources when module is deallocated
    deinit {
        // Use resource manager for proper cleanup
        resourceManager?.cleanupAllResources()
        resourceManager = nil
        
        // Stop motion tracking if active
        motionManager.stopDeviceMotionUpdates()
        
        // Stop haptic engine
        hapticEngine?.stop()
        hapticEngine = nil
        
        // Remove any remaining observers (resource manager should handle most)
        NotificationCenter.default.removeObserver(self)
    }

    // MARK: - Liquid Animation Layer
    private func createLiquidAnimationLayer() -> CALayer {
        let liquidLayer = CAGradientLayer()
        liquidLayer.type = .radial
        liquidLayer.colors = [
            UIColor.white.withAlphaComponent(0.1).cgColor,
            UIColor.white.withAlphaComponent(0.05).cgColor,
            UIColor.clear.cgColor,
        ]
        liquidLayer.locations = [0, 0.5, 1]
        let animation = CABasicAnimation(keyPath: "locations")
        animation.fromValue = [0, 0.3, 0.6]
        animation.toValue = [0.4, 0.7, 1]
        animation.duration = 4.0
        animation.repeatCount = .infinity
        animation.autoreverses = true
        liquidLayer.add(animation, forKey: "liquidFlow")
        return liquidLayer
    }

    // MARK: - Parallax Effect
    private func addParallaxEffect(to view: UIView) {
        let horizontalEffect = UIInterpolatingMotionEffect(keyPath: "layer.transform.translation.x", type: .tiltAlongHorizontalAxis)
        horizontalEffect.minimumRelativeValue = -15
        horizontalEffect.maximumRelativeValue = 15
        let verticalEffect = UIInterpolatingMotionEffect(keyPath: "layer.transform.translation.y", type: .tiltAlongVerticalAxis)
        verticalEffect.minimumRelativeValue = -15
        verticalEffect.maximumRelativeValue = 15
        let group = UIMotionEffectGroup()
        group.motionEffects = [horizontalEffect, verticalEffect]
        view.addMotionEffect(group)
    }

    // MARK: - Haptic Feedback
    private func setupHapticEngine() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        do {
            hapticEngine = try CHHapticEngine()
            try hapticEngine?.start()
        } catch {
            print("Failed to start haptic engine: \(error)")
        }
    }

    private func addHapticInteraction(to view: UIView) {
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap))
        view.addGestureRecognizer(tapGesture)
        let panGesture = UIPanGestureRecognizer(target: self, action: #selector(handlePan))
        view.addGestureRecognizer(panGesture)
    }

    @objc private func handleTap(_ gesture: UITapGestureRecognizer) {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    @objc private func handlePan(_ gesture: UIPanGestureRecognizer) {
        if gesture.state == .began {
            UISelectionFeedbackGenerator().selectionChanged()
        }
    }

    // MARK: - Motion Tracking
    private func setupMotionTracking() {
        guard motionManager.isDeviceMotionAvailable else { return }
        // Already set to 0.1 (10Hz) in init for battery efficiency
        motionManager.startDeviceMotionUpdates(to: .main) { [weak self] motion, _ in
            guard let motion = motion else { return }
            self?.sendEvent(withName: "DeviceMotion", body: [
                "x": motion.gravity.x,
                "y": motion.gravity.y,
                "z": motion.gravity.z,
            ])
        }
    }

    // MARK: - React Native Bridge
    @objc
    override static func requiresMainQueueSetup() -> Bool { true }

    @objc
    override func constantsToExport() -> [String: Any]! {
        [
            "isIOS26Available": NSClassFromString("UILiquidGlassMaterial") != nil,
            "supportedVariants": ["ultra", "prominent", "regular", "thin", "adaptive"],
            "hasHapticSupport": CHHapticEngine.capabilitiesForHardware().supportsHaptics,
        ]
    }

    // MARK: - Manual Cleanup (for testing/troubleshooting)
    @objc
    func cleanupResourcesForView(_ viewId: NSNumber) {
        resourceManager?.removeDisplayLink(for: viewId.intValue)
        resourceManager?.removeViewObserver(for: viewId.intValue)
    }
    
    // MARK: - Bridged API
    @objc
    func updateGlassIntensity(_ viewId: NSNumber,
                              intensity: NSNumber,
                              resolver: RCTPromiseResolveBlock,
                              rejecter: RCTPromiseRejectBlock) {
        resolver(true) // No-op demo implementation
    }

    @objc
    func triggerHapticFeedback(_ type: NSString) {
        switch String(type) {
        case "light": UIImpactFeedbackGenerator(style: .light).impactOccurred()
        case "medium": UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        case "heavy": UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
        case "selection": UISelectionFeedbackGenerator().selectionChanged()
        default: UIImpactFeedbackGenerator(style: .light).impactOccurred()
        }
    }

    @objc
    func startMotionTracking() {
        setupMotionTracking()
    }

    @objc
    func stopMotionTracking() {
        motionManager.stopDeviceMotionUpdates()
    }
}
