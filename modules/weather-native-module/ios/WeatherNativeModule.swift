import Foundation
import React
import CoreLocation
import WeatherKit

@objc(WeatherNativeModule)
final class WeatherNativeModule: NSObject, @unchecked Sendable {
    
    // MARK: - Configuration
    private static let moduleTimeout: TimeInterval = 10.0
    
    // MARK: - Thread-Safe State Management
    private let locationActor = LocationActor()
    
    // Actor for thread-safe location management
    private actor LocationActor {
        private var locationManager: CLLocationManager?
        private var locationDelegate: LocationDelegate?
        private var timeoutTask: Task<Void, Never>?
        private var activeOperations: [String: Task<Any, Error>] = [:]
        
        func getLocationManager() -> CLLocationManager {
            if locationManager == nil {
                locationManager = CLLocationManager()
            }
            return locationManager!
        }
        
        func setLocationDelegate(_ delegate: LocationDelegate?) {
            locationDelegate = delegate
        }
        
        func getLocationDelegate() -> LocationDelegate? {
            return locationDelegate
        }
        
        func setTimeoutTask(_ task: Task<Void, Never>?) {
            timeoutTask?.cancel()
            timeoutTask = task
        }
        
        func cancelTimeoutTask() {
            timeoutTask?.cancel()
            timeoutTask = nil
        }
        
        func cleanup() {
            locationDelegate = nil
            cancelTimeoutTask()
        }
    }
    
    // MARK: - Public Interface
    
    @objc static func isAvailable() -> Bool {
        if #available(iOS 16.0, *) {
            return true
        }
        return false
    }
    
    @objc func isAvailable(
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        resolver(Self.isAvailable())
    }
    
    @objc func getCurrentLocation(
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        Task {
            do {
                let location = try await getCurrentLocationAsync()
                let result: [String: Any] = [
                    "latitude": location.coordinate.latitude,
                    "longitude": location.coordinate.longitude,
                    "accuracy": location.horizontalAccuracy
                ]
                resolver(result)
            } catch {
                rejecter("LOCATION_ERROR", error.localizedDescription, error)
            }
        }
    }
    
    @objc func getUVIndexData(
        latitude: Double,
        longitude: Double,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        Task {
            do {
                let uvData = try await getUVIndexDataAsync(latitude: latitude, longitude: longitude)
                resolver(uvData)
            } catch {
                rejecter("UV_DATA_ERROR", error.localizedDescription, error)
            }
        }
    }
    
    @objc func getWeatherData(
        latitude: Double,
        longitude: Double,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        Task {
            do {
                let weatherData = try await getWeatherDataAsync(latitude: latitude, longitude: longitude)
                resolver(weatherData)
            } catch {
                rejecter("WEATHER_DATA_ERROR", error.localizedDescription, error)
            }
        }
    }
    
    // MARK: - Private Implementation
    
    private func getCurrentLocationAsync() async throws -> CLLocation {
        let locationManager = await locationActor.getLocationManager()
        
        return try await withCheckedThrowingContinuation { continuation in
            Task {
                // Create continuation wrapper to ensure single resume
                let continuationWrapper = ContinuationWrapper(continuation: continuation)
                
                // Create and store delegate to prevent deallocation
                let delegate = LocationDelegate { [weak self] result in
                    Task {
                        // Cancel timeout and clean up
                        await self?.locationActor.cancelTimeoutTask()
                        await self?.locationActor.cleanup()
                        continuationWrapper.resume(with: result)
                    }
                }
                
                // Store strong reference to delegate
                await locationActor.setLocationDelegate(delegate)
                await MainActor.run {
                    locationManager.delegate = delegate
                    
                    // Check authorization status first
                    let authStatus = locationManager.authorizationStatus
                    if authStatus == .denied || authStatus == .restricted {
                        Task {
                            await self.locationActor.cleanup()
                            continuationWrapper.resume(throwing: WeatherError.locationNotAuthorized)
                        }
                        return
                    }
                    
                    if authStatus == .notDetermined {
                        locationManager.requestWhenInUseAuthorization()
                    }
                    
                    locationManager.requestLocation()
                }
                
                // Add timeout with cancellation support
                let timeoutTask = Task {
                    try? await Task.sleep(nanoseconds: UInt64(Self.moduleTimeout * 1_000_000_000))
                    if !Task.isCancelled {
                        await self.locationActor.cleanup()
                        await MainActor.run {
                            locationManager.delegate = nil
                        }
                        continuationWrapper.resume(throwing: WeatherError.locationTimeout)
                    }
                }
                await locationActor.setTimeoutTask(timeoutTask)
            }
        }
    }
    
    @available(iOS 16.0, *)
    private func getUVIndexDataAsync(latitude: Double, longitude: Double) async throws -> [String: Any] {
        // Validate coordinates
        guard validateCoordinates(latitude: latitude, longitude: longitude) else {
            throw WeatherError.invalidCoordinates
        }
        
        let location = CLLocation(latitude: latitude, longitude: longitude)
        
        // Check for WeatherKit availability with proper entitlement check
        guard WeatherService.isAvailable else {
            // Fallback to mock data when WeatherKit unavailable
            return getFallbackUVData(for: location)
        }
        
        let weatherService = WeatherService()
        
        do {
            let weather = try await weatherService.weather(for: location)
            let uvIndex = weather.currentWeather.uvIndex
            
            // Calculate peak time (simplified - usually around solar noon)
            let calendar = Calendar.current
            let noon = calendar.date(bySettingHour: 12, minute: 0, second: 0, of: Date()) ?? Date()
            let formatter = DateFormatter()
            formatter.dateFormat = "h:mm a"
            
            return [
                "uvIndex": uvIndex.value,
                "maxUVToday": uvIndex.value + 2, // Simplified calculation
                "peakTime": formatter.string(from: noon)
            ]
        } catch let error as NSError {
            // Check for specific WeatherKit errors
            if error.domain == "WeatherDaemon.WDSJWTAuthenticatorService.Errors" {
                throw WeatherError.weatherKitEntitlementMissing
            }
            throw WeatherError.weatherServiceUnavailable
        }
    }
    
    @available(iOS 16.0, *)
    private func getWeatherDataAsync(latitude: Double, longitude: Double) async throws -> [String: Any] {
        // Validate coordinates
        guard validateCoordinates(latitude: latitude, longitude: longitude) else {
            throw WeatherError.invalidCoordinates
        }
        
        let location = CLLocation(latitude: latitude, longitude: longitude)
        
        // Check for WeatherKit availability with proper entitlement check
        guard WeatherService.isAvailable else {
            // Fallback to mock data when WeatherKit unavailable
            return getFallbackWeatherData(for: location)
        }
        
        let weatherService = WeatherService()
        
        do {
            let weather = try await weatherService.weather(for: location)
            let current = weather.currentWeather
            var code = 0
            // Primary mapping via WeatherKit condition (coarse categories)
            switch current.condition {
            case .clear:
                code = 0
            case .partlyCloudy:
                code = 2
            case .cloudy:
                code = 3
            case .fog:
                code = 45
            case .drizzle:
                code = 53
            case .rain:
                code = 63
            case .snow:
                code = 73
            case .thunderstorms:
                code = 95
            default:
                code = 0
            }

            // Refine mapping with SF Symbol if available (more granular)
            let symbol = current.symbolName.lowercased()
            if symbol.contains("bolt") {
                code = 95 // Thunderstorm
            } else if symbol.contains("heavysnow") {
                code = 75
            } else if symbol.contains("snow") {
                code = 73
            } else if symbol.contains("sleet") {
                code = 66
            } else if symbol.contains("heavyrain") {
                code = 65
            } else if symbol.contains("drizzle") {
                code = 53
            } else if symbol.contains("showers") || symbol.contains("rain") {
                // Map showers to 81 (moderate rain showers) as a reasonable default
                code = symbol.contains("showers") ? 81 : 63
            } else if symbol.contains("fog") || symbol.contains("smoke") || symbol.contains("haze") {
                code = 45
            } else if symbol.contains("cloud.sun") || (symbol.contains("sun") && symbol.contains("cloud")) {
                code = 2
            } else if symbol.contains("cloud") {
                code = 3
            } else if symbol.contains("sun") {
                code = 0
            }
            
            return [
                "temperature": current.temperature.value,
                "description": current.condition.description,
                "weatherCode": code,
                "humidity": weather.currentWeather.humidity,
                "windSpeed": current.wind.speed.value,
                "pressure": weather.currentWeather.pressure.value,
                "visibility": weather.currentWeather.visibility.value,
                "feelsLike": current.apparentTemperature.value
            ]
        } catch let error as NSError {
            // Check for specific WeatherKit errors
            if error.domain == "WeatherDaemon.WDSJWTAuthenticatorService.Errors" {
                throw WeatherError.weatherKitEntitlementMissing
            }
            throw WeatherError.weatherServiceUnavailable
        }
    }
}

// MARK: - React Native Bridge
extension WeatherNativeModule {
    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }
}

// MARK: - Location Delegate
private class LocationDelegate: NSObject, CLLocationManagerDelegate {
    private let completion: (Result<CLLocation, Error>) -> Void
    
    init(completion: @escaping (Result<CLLocation, Error>) -> Void) {
        self.completion = completion
        super.init()
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.first else {
            completion(.failure(WeatherError.locationNotAvailable))
            return
        }
        completion(.success(location))
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        completion(.failure(error))
    }
}

// MARK: - Weather Errors
enum WeatherError: Error, LocalizedError {
    case locationManagerNotAvailable
    case locationNotAvailable
    case locationNotAuthorized
    case locationTimeout
    case weatherServiceUnavailable
    case weatherKitEntitlementMissing
    case invalidCoordinates
    
    var errorDescription: String? {
        switch self {
        case .locationManagerNotAvailable:
            return "Unable to access location services"
        case .locationNotAvailable:
            return "Unable to determine current location"
        case .locationNotAuthorized:
            return "Location access is required for weather data. Please enable in Settings."
        case .locationTimeout:
            return "Unable to get location. Please try again."
        case .weatherServiceUnavailable:
            return "Weather data temporarily unavailable"
        case .weatherKitEntitlementMissing:
            return "Weather data temporarily unavailable"
        case .invalidCoordinates:
            return "Invalid location coordinates provided"
        }
    }
}

// MARK: - Helper Types
private class ContinuationWrapper<T> {
    private var continuation: CheckedContinuation<T, Error>?
    private let lock = NSLock()
    private var hasResumed = false
    
    init(continuation: CheckedContinuation<T, Error>) {
        self.continuation = continuation
    }
    
    func resume(with result: Result<T, Error>) {
        lock.lock()
        defer { lock.unlock() }
        
        guard !hasResumed, let continuation = continuation else { return }
        hasResumed = true
        self.continuation = nil
        continuation.resume(with: result)
    }
    
    func resume(returning value: T) {
        resume(with: .success(value))
    }
    
    func resume(throwing error: Error) {
        resume(with: .failure(error))
    }
}

// MARK: - Validation
extension WeatherNativeModule {
    private func validateCoordinates(latitude: Double, longitude: Double) -> Bool {
        guard !latitude.isNaN && !latitude.isInfinite else { return false }
        guard !longitude.isNaN && !longitude.isInfinite else { return false }
        guard latitude >= -90 && latitude <= 90 else { return false }
        guard longitude >= -180 && longitude <= 180 else { return false }
        return true
    }
    
    // Fallback data providers
    private func getFallbackUVData(for location: CLLocation) -> [String: Any] {
        return [
            "uvIndex": 5,
            "maxUVToday": 7,
            "peakTime": "12:00 PM",
            "isFallback": true
        ]
    }
    
    private func getFallbackWeatherData(for location: CLLocation) -> [String: Any] {
        return [
            "temperature": 22.0,
            "description": "Partly Cloudy",
            "weatherCode": 2,
            "humidity": 65.0,
            "windSpeed": 5.5,
            "pressure": 1013.25,
            "visibility": 10000.0,
            "feelsLike": 21.0,
            "isFallback": true
        ]
    }
}
