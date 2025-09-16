# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## iOS Native Module Architecture

The iOS native codebase implements weather functionality through Swift modules that integrate with React Native via the New Architecture (TurboModules).

### Key Native Components

**WeatherNativeModule** (`modules/weather-native-module/ios/`)
- Thread-safe weather data provider using Swift Actor pattern
- WeatherKit integration with automatic fallback to OpenMeteo
- Location services via CoreLocation
- UV index calculations with solar position algorithms
- 10-minute cache per location with concurrent request deduplication

**Module Interface**
- `isAvailable()` → Bool - Check WeatherKit availability
- `getCurrentLocation()` → LocationData - GPS coordinates with accuracy
- `getWeatherData(lat, lon)` → WeatherData - Cached weather with fallback
- `calculateUVIndex(lat, lon, timestamp?)` → UVIndexData - Solar calculations

## Essential iOS Commands

```bash
# Build & Test
cd ios && pod install --repo-update       # Install/update CocoaPods
xcodebuild -scheme WeatherSunscreen -destination 'platform=iOS Simulator,name=iPhone 15' build
xcodebuild test -scheme WeatherSunscreen -destination 'platform=iOS Simulator,name=iPhone 15'

# Quick Fixes
pod deintegrate && pod install            # Reset CocoaPods completely
../scripts/fix-fabric-headers.sh          # Fix React Native header issues
../scripts/patch-expo-updates.sh          # Fix EASClient cycle (auto-runs in Podfile)
../scripts/xcode-clean.sh                 # Deep clean Xcode artifacts

# Release Build
xcodebuild -scheme WeatherSunscreen -configuration Release -destination generic/platform=iOS archive
```

## iOS Configuration

### Build Settings
- **Deployment Target**: iOS 16.0 (production), iOS 26.0 (development via ios26-config.xcconfig)
- **Swift Version**: 6.0 with strict concurrency
- **New Architecture**: Enabled (`ENV['RCT_NEW_ARCH_ENABLED'] = '1'`)
- **Baseline Simulator**: iOS 26.0 (17A321)
- **Xcode Requirement**: 16+ (26.0 for iOS 26 features)

### Security Implementation
- Actor-based concurrency prevents race conditions
- Weak references eliminate retain cycles
- Input validation on all coordinate parameters
- Sanitized error messages without implementation details
- Location permission: NSLocationWhenInUseUsageDescription only
- Motion tracking: Throttled to 10Hz (83% battery savings)

## Testing Infrastructure

### Native Test Files
- `WeatherSunscreenTests/WeatherNativeModuleTests.swift` - Module functionality
- `WeatherSunscreenTests/SecurityFixTests.swift` - Security vulnerability coverage

### Running Specific Tests
```bash
# All tests
xcodebuild test -scheme WeatherSunscreen

# Single test class
xcodebuild test -scheme WeatherSunscreen -only-testing:WeatherSunscreenTests/SecurityFixTests

# With coverage
xcodebuild test -scheme WeatherSunscreen -enableCodeCoverage YES
```

## CocoaPods Configuration

### Critical Podfile Settings
- Hermes prebuilt disabled for Xcode 26: `ENV['HERMES_USE_PREBUILT_BINARY'] = '0'`
- EASClient/EXApplication forced to static libraries (prevents dependency cycles)
- Auto-patches Expo Updates via `scripts/patch-expo-updates.sh`
- React Native prebuilt core: `ENV['RCT_USE_PREBUILT_RNCORE'] = '1'`

### Pod Installation Flow
1. `pod install` triggers patch-expo-updates.sh automatically
2. Script inlines EAS client ID to break dependency cycle
3. Forces static library build for problematic Expo pods
4. Runs expo_patch_react_imports post-integration

## WeatherKit Integration

### Requirements
- Apple Developer account with WeatherKit capability enabled
- Bundle identifier must match provisioning profile
- Entitlements: `com.apple.developer.weatherkit`

### Fallback Behavior
- Primary: WeatherKit (requires capability)
- Fallback: OpenMeteo API (no configuration needed)
- Development: Mock data when running in Expo Go

## Common iOS Build Issues

### Dependency Cycle Error
```
Cycle in dependencies between targets 'EASClient' and 'WeatherSunscreen'
```
**Fix**: Run `bun install && cd ios && pod install` (triggers automatic patch)

### React Native Header Errors
```
'React/RCTBridge.h' file not found
```
**Fix**: Run `scripts/fix-fabric-headers.sh`

### Hermes PhaseScriptExecution Failure
```
PhaseScriptExecution failed with nonzero exit code
```
**Fix**: Podfile sets `ENV['HERMES_USE_PREBUILT_BINARY'] = '0'` for Xcode 26

### Simulator Not Found
```
Unable to find a destination matching the provided destination specifier
```
**Fix**: Script auto-selects valid simulator, or specify: `npm run ios -- --simulator "iPhone 16"`

## Performance Optimizations

### Battery Efficiency
- Motion updates: 10Hz vs default 60Hz (83% power reduction)
- Location: On-demand only, no continuous monitoring
- Weather cache: 10-minute TTL reduces API calls
- Concurrent deduplication: Single request for multiple components

### Memory Management
- Weak self references in all closures
- Proper deinit cleanup in native modules
- No force unwrapping in Swift code
- Actor isolation prevents data races

## Development Workflow

### Adding Native Functionality
1. Create TypeScript spec in `src/specs/NativeModule.ts`
2. Implement Swift module in `modules/[name]/ios/`
3. Register in `modules/[name]/ios/RNModule.m`
4. Run codegen: `cd ios && pod install`
5. Add tests in `WeatherSunscreenTests/`
6. Export wrapper with fallbacks in `src/services/`

### Debugging Native Code
1. Open `ios/WeatherSunscreen.xcworkspace` in Xcode
2. Set breakpoints in Swift/Objective-C files
3. Run app from Xcode with debugger attached
4. Use `os_log` for production logging (not NSLog)