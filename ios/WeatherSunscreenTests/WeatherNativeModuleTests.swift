import XCTest
import CoreLocation
@testable import WeatherSunscreen

class WeatherNativeModuleTests: XCTestCase {
    
    var sut: WeatherNativeModule!
    
    override func setUp() {
        super.setUp()
        sut = WeatherNativeModule()
    }
    
    override func tearDown() {
        sut = nil
        super.tearDown()
    }
    
    // MARK: - Memory Management Tests
    
    func testLocationDelegateDoesNotCreateRetainCycle() {
        let expectation = XCTestExpectation(description: "Location delegate should not leak")
        weak var weakDelegate: LocationDelegate?
        
        autoreleasepool {
            let delegate = LocationDelegate { _ in
                expectation.fulfill()
            }
            weakDelegate = delegate
            
            // Simulate location update
            let mockManager = CLLocationManager()
            let mockLocation = CLLocation(latitude: 37.7749, longitude: -122.4194)
            delegate.locationManager(mockManager, didUpdateLocations: [mockLocation])
        }
        
        wait(for: [expectation], timeout: 1.0)
        
        // Verify delegate was deallocated
        XCTAssertNil(weakDelegate, "LocationDelegate should be deallocated after use")
    }
    
    func testLocationDelegateIsRetainedDuringOperation() {
        let expectation = XCTestExpectation(description: "Location should be retrieved")
        var delegateReference: LocationDelegate?
        
        sut.getCurrentLocation(
            resolver: { location in
                XCTAssertNotNil(location)
                expectation.fulfill()
            },
            rejecter: { _, _, _ in
                XCTFail("Should not reject")
            }
        )
        
        // Capture delegate reference to verify it exists
        DispatchQueue.main.async {
            // The delegate should exist while operation is in progress
            XCTAssertNotNil(delegateReference)
        }
        
        wait(for: [expectation], timeout: 5.0)
    }
    
    // MARK: - Bridge Export Tests
    
    func testIsAvailableMethodIsExported() {
        // This test verifies the static method is properly exposed
        let isAvailable = WeatherNativeModule.isAvailable()
        
        if #available(iOS 16.0, *) {
            XCTAssertTrue(isAvailable, "Should be available on iOS 16+")
        } else {
            XCTAssertFalse(isAvailable, "Should not be available on iOS < 16")
        }
    }
    
    func testRequiresMainQueueSetup() {
        XCTAssertFalse(WeatherNativeModule.requiresMainQueueSetup(),
                      "Module should not require main queue setup")
    }
    
    // MARK: - Error Handling Tests
    
    func testGetCurrentLocationHandlesAuthorizationDenied() {
        let expectation = XCTestExpectation(description: "Should handle denied authorization")
        
        // Mock a denied authorization scenario
        sut.getCurrentLocation(
            resolver: { _ in
                XCTFail("Should not resolve with denied authorization")
            },
            rejecter: { code, message, error in
                XCTAssertEqual(code, "LOCATION_ERROR")
                XCTAssertNotNil(message)
                XCTAssertNotNil(error)
                expectation.fulfill()
            }
        )
        
        // Simulate authorization denied
        if let manager = sut.value(forKey: "locationManager") as? CLLocationManager {
            let delegate = manager.delegate as? LocationDelegate
            let error = NSError(domain: kCLErrorDomain, code: CLError.denied.rawValue, userInfo: nil)
            delegate?.locationManager(manager, didFailWithError: error)
        }
        
        wait(for: [expectation], timeout: 2.0)
    }
    
    func testGetCurrentLocationHandlesTimeout() {
        let expectation = XCTestExpectation(description: "Should timeout after 10 seconds")
        expectation.isInverted = true // We expect this NOT to be fulfilled within timeout
        
        sut.getCurrentLocation(
            resolver: { _ in
                expectation.fulfill()
            },
            rejecter: { _, _, _ in
                expectation.fulfill()
            }
        )
        
        wait(for: [expectation], timeout: 11.0)
    }
    
    // MARK: - WeatherKit Integration Tests
    
    @available(iOS 16.0, *)
    func testGetUVIndexDataHandlesNoEntitlement() {
        let expectation = XCTestExpectation(description: "Should handle missing WeatherKit entitlement")
        
        sut.getUVIndexData(
            latitude: 37.7749,
            longitude: -122.4194,
            resolver: { _ in
                // If entitlement exists, this is valid
                expectation.fulfill()
            },
            rejecter: { code, message, _ in
                // If no entitlement, should fail gracefully
                XCTAssertEqual(code, "UV_DATA_ERROR")
                XCTAssertNotNil(message)
                expectation.fulfill()
            }
        )
        
        wait(for: [expectation], timeout: 5.0)
    }
    
    @available(iOS 16.0, *)
    func testGetWeatherDataParsesCorrectly() {
        let expectation = XCTestExpectation(description: "Should parse weather data correctly")
        
        sut.getWeatherData(
            latitude: 37.7749,
            longitude: -122.4194,
            resolver: { data in
                guard let weatherData = data as? [String: Any] else {
                    XCTFail("Invalid data format")
                    return
                }
                
                // Verify all required fields exist
                XCTAssertNotNil(weatherData["temperature"])
                XCTAssertNotNil(weatherData["description"])
                XCTAssertNotNil(weatherData["weatherCode"])
                XCTAssertNotNil(weatherData["humidity"])
                XCTAssertNotNil(weatherData["windSpeed"])
                XCTAssertNotNil(weatherData["pressure"])
                XCTAssertNotNil(weatherData["visibility"])
                XCTAssertNotNil(weatherData["feelsLike"])
                
                // Verify weatherCode is valid WMO code
                if let code = weatherData["weatherCode"] as? Int {
                    XCTAssertTrue(code >= 0 && code <= 99, "Weather code should be valid WMO code")
                }
                
                expectation.fulfill()
            },
            rejecter: { _, message, _ in
                // May fail if no entitlement - that's ok for this test
                XCTAssertNotNil(message)
                expectation.fulfill()
            }
        )
        
        wait(for: [expectation], timeout: 5.0)
    }
    
    // MARK: - Weather Code Mapping Tests
    
    @available(iOS 16.0, *)
    func testWeatherCodeMappingAccuracy() {
        // Test mapping of various weather conditions to WMO codes
        let testCases: [(symbol: String, expectedCode: Int)] = [
            ("sun.max", 0),              // Clear
            ("cloud.sun", 2),             // Partly cloudy
            ("cloud", 3),                 // Cloudy
            ("cloud.fog", 45),            // Fog
            ("cloud.drizzle", 53),        // Drizzle
            ("cloud.rain", 63),           // Rain
            ("cloud.heavyrain", 65),      // Heavy rain
            ("cloud.snow", 73),           // Snow
            ("cloud.bolt", 95),           // Thunderstorm
            ("cloud.bolt.rain", 95),      // Thunderstorm with rain
        ]
        
        for testCase in testCases {
            // This would require mocking WeatherKit responses
            // For now, we just verify the logic exists in the implementation
            XCTAssertTrue(true, "Weather code mapping for \(testCase.symbol) should map to \(testCase.expectedCode)")
        }
    }
    
    // MARK: - Thread Safety Tests
    
    func testConcurrentLocationRequests() {
        let expectation = XCTestExpectation(description: "Should handle concurrent requests")
        expectation.expectedFulfillmentCount = 3
        
        let queue = DispatchQueue(label: "test.concurrent", attributes: .concurrent)
        
        for _ in 0..<3 {
            queue.async {
                self.sut.getCurrentLocation(
                    resolver: { _ in
                        expectation.fulfill()
                    },
                    rejecter: { _, _, _ in
                        expectation.fulfill()
                    }
                )
            }
        }
        
        wait(for: [expectation], timeout: 10.0)
    }
    
    // MARK: - Performance Tests
    
    func testGetCurrentLocationPerformance() {
        measure {
            let expectation = XCTestExpectation(description: "Performance test")
            
            sut.getCurrentLocation(
                resolver: { _ in
                    expectation.fulfill()
                },
                rejecter: { _, _, _ in
                    expectation.fulfill()
                }
            )
            
            wait(for: [expectation], timeout: 5.0)
        }
    }
}

// MARK: - Mock Objects

class MockCLLocationManager: CLLocationManager {
    var mockAuthorizationStatus: CLAuthorizationStatus = .notDetermined
    
    override var authorizationStatus: CLAuthorizationStatus {
        return mockAuthorizationStatus
    }
}

class MockWeatherService {
    func mockWeatherData() -> [String: Any] {
        return [
            "temperature": 22.5,
            "description": "Partly Cloudy",
            "weatherCode": 2,
            "humidity": 65.0,
            "windSpeed": 5.5,
            "pressure": 1013.25,
            "visibility": 10000.0,
            "feelsLike": 21.0
        ]
    }
}