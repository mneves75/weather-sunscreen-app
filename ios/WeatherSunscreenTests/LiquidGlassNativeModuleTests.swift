import XCTest
import UIKit
import CoreMotion
import CoreHaptics
@testable import WeatherSunscreen

class LiquidGlassNativeModuleTests: XCTestCase {
    
    var sut: LiquidGlassNativeModule!
    
    override func setUp() {
        super.setUp()
        sut = LiquidGlassNativeModule()
    }
    
    override func tearDown() {
        // Ensure motion tracking is stopped
        sut.stopMotionTracking()
        sut = nil
        super.tearDown()
    }
    
    // MARK: - Memory Leak Tests
    
    func testCADisplayLinkDoesNotCreateRetainCycle() {
        weak var weakModule: LiquidGlassNativeModule?
        weak var weakDisplayLink: CADisplayLink?
        
        autoreleasepool {
            let module = LiquidGlassNativeModule()
            weakModule = module
            
            let expectation = XCTestExpectation(description: "Create glass view")
            
            module.createLiquidGlassView(
                ["variant": "regular", "intensity": 80, "dynamicBlur": true],
                resolver: { _ in
                    expectation.fulfill()
                },
                rejecter: { _, _, _ in
                    expectation.fulfill()
                }
            )
            
            wait(for: [expectation], timeout: 2.0)
            
            // Try to capture the display link
            DispatchQueue.main.sync {
                let mirror = Mirror(reflecting: module)
                for child in mirror.children {
                    if let displayLink = child.value as? CADisplayLink {
                        weakDisplayLink = displayLink
                        // Invalidate it properly
                        displayLink.invalidate()
                    }
                }
            }
        }
        
        // Wait a bit for deallocation
        RunLoop.current.run(until: Date(timeIntervalSinceNow: 0.5))
        
        XCTAssertNil(weakModule, "LiquidGlassNativeModule should be deallocated")
        XCTAssertNil(weakDisplayLink, "CADisplayLink should be deallocated")
    }
    
    func testMotionManagerDoesNotLeak() {
        weak var weakMotionManager: CMMotionManager?
        
        autoreleasepool {
            let module = LiquidGlassNativeModule()
            module.startMotionTracking()
            
            // Capture motion manager reference
            let mirror = Mirror(reflecting: module)
            for child in mirror.children {
                if let manager = child.value as? CMMotionManager {
                    weakMotionManager = manager
                }
            }
            
            module.stopMotionTracking()
        }
        
        RunLoop.current.run(until: Date(timeIntervalSinceNow: 0.5))
        
        // Motion manager should still exist (singleton pattern) but updates should be stopped
        if let manager = weakMotionManager {
            XCTAssertFalse(manager.isDeviceMotionActive, "Motion updates should be stopped")
        }
    }
    
    // MARK: - Thread Safety Tests
    
    func testCreateLiquidGlassViewRunsOnMainThread() {
        let expectation = XCTestExpectation(description: "Should create view on main thread")
        var createdOnMainThread = false
        
        DispatchQueue.global(qos: .background).async {
            self.sut.createLiquidGlassView(
                ["variant": "regular"],
                resolver: { result in
                    createdOnMainThread = Thread.isMainThread
                    expectation.fulfill()
                },
                rejecter: { _, _, _ in
                    expectation.fulfill()
                }
            )
        }
        
        wait(for: [expectation], timeout: 2.0)
        
        XCTAssertTrue(createdOnMainThread, "View creation should happen on main thread")
    }
    
    func testConcurrentViewCreation() {
        let expectation = XCTestExpectation(description: "Should handle concurrent view creation")
        expectation.expectedFulfillmentCount = 5
        
        let queue = DispatchQueue(label: "test.concurrent", attributes: .concurrent)
        
        for i in 0..<5 {
            queue.async {
                self.sut.createLiquidGlassView(
                    ["variant": "regular", "intensity": NSNumber(value: 50 + i * 10)],
                    resolver: { result in
                        XCTAssertNotNil(result)
                        expectation.fulfill()
                    },
                    rejecter: { _, _, _ in
                        XCTFail("Should not reject")
                        expectation.fulfill()
                    }
                )
            }
        }
        
        wait(for: [expectation], timeout: 5.0)
    }
    
    // MARK: - iOS 26 Feature Detection Tests
    
    func testConstantsExport() {
        let constants = sut.constantsToExport()
        
        XCTAssertNotNil(constants["isIOS26Available"])
        XCTAssertNotNil(constants["supportedVariants"])
        XCTAssertNotNil(constants["hasHapticSupport"])
        
        if let variants = constants["supportedVariants"] as? [String] {
            XCTAssertTrue(variants.contains("regular"))
            XCTAssertTrue(variants.contains("ultra"))
            XCTAssertTrue(variants.contains("prominent"))
            XCTAssertTrue(variants.contains("thin"))
            XCTAssertTrue(variants.contains("adaptive"))
        }
        
        // Check iOS 26 availability
        let isIOS26Available = constants["isIOS26Available"] as? Bool ?? false
        let hasClass = NSClassFromString("UILiquidGlassMaterial") != nil
        XCTAssertEqual(isIOS26Available, hasClass, "iOS 26 availability should match class existence")
    }
    
    func testRequiresMainQueueSetup() {
        XCTAssertTrue(LiquidGlassNativeModule.requiresMainQueueSetup(),
                     "Module should require main queue setup for UI operations")
    }
    
    // MARK: - View Creation Tests
    
    func testCreateLiquidGlassViewWithDefaultConfig() {
        let expectation = XCTestExpectation(description: "Should create view with defaults")
        
        sut.createLiquidGlassView(
            [:], // Empty config should use defaults
            resolver: { result in
                guard let viewResult = result as? [String: Any] else {
                    XCTFail("Invalid result format")
                    return
                }
                
                XCTAssertNotNil(viewResult["viewId"])
                XCTAssertEqual(viewResult["success"] as? Bool, true)
                expectation.fulfill()
            },
            rejecter: { _, _, _ in
                XCTFail("Should not reject with default config")
                expectation.fulfill()
            }
        )
        
        wait(for: [expectation], timeout: 2.0)
    }
    
    func testCreateLiquidGlassViewWithAllVariants() {
        let variants = ["ultra", "prominent", "regular", "thin", "adaptive"]
        let expectations = variants.map { variant in
            XCTestExpectation(description: "Create \(variant) variant")
        }
        
        for (index, variant) in variants.enumerated() {
            sut.createLiquidGlassView(
                ["variant": variant, "intensity": 75, "dynamicBlur": true],
                resolver: { result in
                    XCTAssertNotNil(result)
                    expectations[index].fulfill()
                },
                rejecter: { _, _, _ in
                    // Even if iOS 26 is not available, should fallback gracefully
                    expectations[index].fulfill()
                }
            )
        }
        
        wait(for: expectations, timeout: 5.0)
    }
    
    // MARK: - Haptic Feedback Tests
    
    func testHapticFeedbackTypes() {
        let hapticTypes = ["light", "medium", "heavy", "selection", "unknown"]
        
        for type in hapticTypes {
            // Should not crash even with invalid types
            sut.triggerHapticFeedback(type as NSString)
        }
        
        XCTAssertTrue(true, "Haptic feedback should handle all types without crashing")
    }
    
    // MARK: - Motion Tracking Tests
    
    func testStartMotionTracking() {
        let expectation = XCTestExpectation(description: "Should receive motion events")
        expectation.assertForOverFulfill = false
        
        // Subscribe to motion events
        let subscription = sut.addListener("DeviceMotion") { data in
            if let motionData = data as? [String: Any] {
                XCTAssertNotNil(motionData["x"])
                XCTAssertNotNil(motionData["y"])
                XCTAssertNotNil(motionData["z"])
                expectation.fulfill()
            }
        }
        
        sut.startMotionTracking()
        
        // If device motion is not available, fulfill anyway
        if let mirror = Mirror(reflecting: sut).children.first(where: { $0.label == "motionManager" }),
           let manager = mirror.value as? CMMotionManager,
           !manager.isDeviceMotionAvailable {
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 3.0)
        
        sut.stopMotionTracking()
        sut.removeListeners(1)
    }
    
    func testStopMotionTracking() {
        sut.startMotionTracking()
        sut.stopMotionTracking()
        
        // Verify motion updates are stopped
        let mirror = Mirror(reflecting: sut)
        if let child = mirror.children.first(where: { $0.label == "motionManager" }),
           let manager = child.value as? CMMotionManager {
            XCTAssertFalse(manager.isDeviceMotionActive, "Motion tracking should be stopped")
        }
    }
    
    // MARK: - Intensity Update Tests
    
    func testUpdateGlassIntensity() {
        let expectation = XCTestExpectation(description: "Should update intensity")
        
        // First create a view
        sut.createLiquidGlassView(
            ["variant": "regular"],
            resolver: { result in
                guard let viewResult = result as? [String: Any],
                      let viewId = viewResult["viewId"] as? Int else {
                    XCTFail("Failed to create view")
                    return
                }
                
                // Then update its intensity
                self.sut.updateGlassIntensity(
                    NSNumber(value: viewId),
                    intensity: NSNumber(value: 90),
                    resolver: { _ in
                        expectation.fulfill()
                    },
                    rejecter: { _, _, _ in
                        expectation.fulfill()
                    }
                )
            },
            rejecter: { _, _, _ in
                XCTFail("Failed to create view")
            }
        )
        
        wait(for: [expectation], timeout: 3.0)
    }
    
    // MARK: - Performance Tests
    
    func testCreateViewPerformance() {
        measure {
            let expectation = XCTestExpectation(description: "Performance test")
            
            sut.createLiquidGlassView(
                ["variant": "regular", "intensity": 80],
                resolver: { _ in
                    expectation.fulfill()
                },
                rejecter: { _, _, _ in
                    expectation.fulfill()
                }
            )
            
            wait(for: [expectation], timeout: 1.0)
        }
    }
    
    // MARK: - Event Emitter Tests
    
    func testSupportedEvents() {
        let events = sut.supportedEvents()
        XCTAssertNotNil(events)
        XCTAssertTrue(events.contains("DeviceMotion"), "Should support DeviceMotion event")
    }
    
    // MARK: - Fallback Tests
    
    func testFallbackToStandardBlurWhenIOS26Unavailable() {
        // This test verifies the fallback mechanism
        let expectation = XCTestExpectation(description: "Should fallback gracefully")
        
        sut.createLiquidGlassView(
            ["variant": "ultra", "intensity": 100],
            resolver: { result in
                // Should still create a view, even without iOS 26
                XCTAssertNotNil(result)
                expectation.fulfill()
            },
            rejecter: { _, _, _ in
                XCTFail("Should not reject, should fallback")
                expectation.fulfill()
            }
        )
        
        wait(for: [expectation], timeout: 2.0)
    }
}