# CLAUDE.md - iOS Development Guide

This file provides guidance to Claude Code (claude.ai/code) when working with the iOS codebase.

## Project Status
**Security Audit:** ✅ PASSED (2025-09-09)
**All critical vulnerabilities fixed**

## Essential iOS Commands

```bash
# Build & Run
cd ios && pod install          # Install dependencies
xcodebuild -scheme WeatherSunscreen -destination 'platform=iOS Simulator,name=iPhone 15' build

# Testing
xcodebuild test -scheme WeatherSunscreen -destination 'platform=iOS Simulator,name=iPhone 15'

# Fix common issues
scripts/fix-fabric-headers.sh  # Fix React Native header issues
pod deintegrate && pod install # Reset CocoaPods
```

## iOS Architecture

### Native Modules
- **WeatherNativeModule**: Thread-safe weather data with Actor pattern
- **Liquid Glass**: Implemented via `expo-glass-effect` (JS). No custom LiquidGlass native module is used anymore.

### Key Security Improvements (2025-09-09)
1. **Thread Safety**: Actor-based concurrency for all state management
2. **Memory Management**: No retain cycles, proper cleanup in deinit
3. **Error Handling**: Comprehensive validation and fallback mechanisms
4. **Permissions**: Minimal location access with clear descriptions

## iOS 26 Configuration
- Baseline simulator runtime: iOS 26.0 (17A321)
- Deployment Target: iOS 26.0 (when using ios26-config.xcconfig)
- Swift Version: 6.0
- Fallback: iOS 16.0 minimum for production

## Testing

### Test Files
- `WeatherSunscreenTests/SecurityFixTests.swift` - Security vulnerability tests
- `WeatherSunscreenTests/WeatherNativeModuleTests.swift` - Weather module tests
  
Note: Liquid Glass UI is covered by JS tests. The former native `LiquidGlassNativeModule` tests were removed.

### Run Tests
```bash
# Run all iOS tests
xcodebuild test -scheme WeatherSunscreen -destination 'platform=iOS Simulator,name=iPhone 15'

# Run specific test
xcodebuild test -scheme WeatherSunscreen -only-testing:WeatherSunscreenTests/SecurityFixTests
```

## Security Checklist ✅
- [x] WeatherKit entitlement configured
- [x] No race conditions (Actor pattern)
- [x] No memory leaks (weak references)
- [x] No force unwrapping
- [x] Thread-safe state management
- [x] Relative paths in scripts
- [x] Minimal permissions
- [x] Input validation
- [x] Error message sanitization
- [x] Battery-efficient motion tracking (10Hz)

## Important Notes
- Always reference Apple API docs in @docs project folder
- WeatherKit requires Apple Developer account configuration
- Use Xcode 16+ for iOS 26 features
- Swift 6.0 strict concurrency enabled
