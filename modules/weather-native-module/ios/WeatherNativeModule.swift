import Foundation
import React
import CoreLocation
import WeatherKit

@objc(WeatherNativeModule)
final class WeatherNativeModule: NSObject, @unchecked Sendable {
    
    // MARK: - Configuration
    private static let moduleTimeout: TimeInterval = 10.0
    
    // MARK: - State (MainActor for thread safety)
    @MainActor private var activeOperations: [String: Task<Any, Error>] = [:]
    @MainActor private var locationManager: CLLocationManager?
    
    // MARK: - Public Interface
    
    @objc static func isAvailable() -> Bool {
        if #available(iOS 16.0, *) {
            return true
        }
        return false
    }
    
    @objc func getCurrentLocation(
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        Task {
            await MainActor.run {
                self.locationManager = CLLocationManager()
            }
            
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
        guard let locationManager = await MainActor.run(body: { self.locationManager }) else {
            throw WeatherError.locationManagerNotAvailable
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            let delegate = LocationDelegate { result in
                continuation.resume(with: result)
            }
            
            Task { @MainActor in
                locationManager.delegate = delegate
                locationManager.requestWhenInUseAuthorization()
                locationManager.requestLocation()
            }
        }
    }
    
    @available(iOS 16.0, *)
    private func getUVIndexDataAsync(latitude: Double, longitude: Double) async throws -> [String: Any] {
        let location = CLLocation(latitude: latitude, longitude: longitude)
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
        } catch {
            throw WeatherError.weatherServiceUnavailable
        }
    }
    
    @available(iOS 16.0, *)
    private func getWeatherDataAsync(latitude: Double, longitude: Double) async throws -> [String: Any] {
        let location = CLLocation(latitude: latitude, longitude: longitude)
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
        } catch {
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
    case weatherServiceUnavailable
    
    var errorDescription: String? {
        switch self {
        case .locationManagerNotAvailable:
            return "Location manager is not available"
        case .locationNotAvailable:
            return "Current location is not available"
        case .weatherServiceUnavailable:
            return "Weather service is unavailable"
        }
    }
}
