# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Weather Sunscreen App - React Native (Expo) mobile app providing real-time weather, UV index monitoring, and personalized sunscreen recommendations.

- **Stack**: React Native 0.81.1, Expo 54.0.0-preview.12, TypeScript 5.9.2
- **Platforms**: iOS 16+, Android API 29+, Web
- **Package Manager**: Bun (preferred) or npm fallback

## Essential Commands

```bash
# Development
bun start               # Start Expo dev server
bun run ios            # Run on iOS (or: npx expo run:ios --device <ID>)
bun run android        # Run on Android (Java 17 configured)
bun run web            # Run web version

# Build & Deploy
npx eas build --platform ios --profile production
npx eas build --platform android --profile production

# Testing & Quality
bun test               # Run Jest tests
bun run lint           # ESLint check
bun run typecheck      # TypeScript validation

# iOS Troubleshooting
bun run fix-pods       # Complete CocoaPods cleanup
bun run clean-ios      # Quick iOS cleanup
scripts/fix-fabric-headers.sh  # Fix React Native header issues

# Version Management
bun run sync-versions  # Sync version from CHANGELOG.md to all files
```

## Architecture

### Directory Structure

```
src/
├── components/        # UI components (ui/, icons/, glass/)
├── context/          # React Context providers (Weather, Sunscreen, Theme)
├── navigation/       # Navigation config and screen components
├── services/         # Business logic, APIs, logging
└── types/           # TypeScript definitions

modules/              # Native modules (weather-native-module)
scripts/             # Build and fix scripts
```

### Key Services

**LoggerService** (`src/services/loggerService.ts`)

- **CRITICAL**: Never use console.log/warn/error directly
- Use: `logger.info()`, `logger.warn()`, `logger.error()`
- Includes structured logging for API calls and user actions

**WeatherService** (`src/services/openMeteoService.ts`)

- Fetches weather data from Open-Meteo API
- 10-minute caching strategy
- Handles location and fallback scenarios

### State Management

- React Context with useReducer for complex state
- AsyncStorage for persistence
- Contexts: WeatherContext, SunscreenContext, ThemeContext

## iOS Security Status ✅

**Security Audit Passed: 2025-09-09**

- All 8 CRITICAL vulnerabilities fixed (CVSS 7.0-9.1)
- Thread-safe with Actor-based concurrency
- Memory leak free with proper lifecycle management
- Battery efficient (83% reduction in motion tracking)

### iOS Build & Testing

```bash
# Setup iOS dependencies
cd ios && pod install

# Run security tests
xcodebuild test -scheme WeatherSunscreen -only-testing:WeatherSunscreenTests/SecurityFixTests

# Fix React Native headers if needed
scripts/fix-fabric-headers.sh
```

### Key iOS Improvements

1. **WeatherKit**: Entitlement configured with fallback
2. **Thread Safety**: Actor pattern for state management
3. **Memory**: No retain cycles, proper cleanup
4. **Permissions**: Minimal location access only
5. **Performance**: Motion updates throttled to 10Hz

## Native Modules

### Weather Native Module

- Location: `modules/weather-native-module/`
- Features: GPS location, weather data, UV index calculations
- Fallback: Expo Location + mock data for web/older devices
- **WeatherKit**: Requires Apple Developer capability enabled

Usage:

```typescript
import { WeatherNativeService } from '../modules/weather-native-module';

const available = await WeatherNativeService.isAvailable();
const location = await WeatherNativeService.getCurrentLocation();
const weather = await WeatherNativeService.getWeatherData(lat, lon);
```

### iOS 26 Liquid Glass Implementation ✅

- **Status**: Memory-safe implementation with weak references
- **Documentation**: See `docs/apple/` for API guides
- **Module**: `LiquidGlassNativeModule` with proper lifecycle
- **Performance**: Motion tracking throttled to 10Hz

```swift
// Thread-safe implementation
private class DisplayLinkProxy: NSObject {
    weak var target: LiquidGlassNativeModule?  // No retain cycle
    deinit { stop() }  // Proper cleanup
}
```

**Configuration**:

- iOS 26.0 deployment target (ios26-config.xcconfig)
- Swift 6.0 with strict concurrency
- Fallback to iOS 16.0 for production

## Development Guidelines

### TypeScript Requirements

- Strict mode enabled
- Explicit function signatures on exports
- No `any` types - use proper domain types
- Types in `src/types/` (weather.ts, navigation.ts, theme.ts, sunscreen.ts)

### Component Patterns

- Functional components with TypeScript interfaces
- React.memo for expensive weather displays
- Error boundaries at appropriate levels
- Custom hooks for reusable logic

### Performance Optimization

- 10-minute weather data caching
- Proper useCallback/useMemo dependencies
- Cleanup in useEffect for timers/subscriptions
- Track mount state for async operations

### Security & Privacy

- No direct console logging in production
- Location permissions with clear explanations
- HTTPS only for API calls
- Input validation on all user data

## Testing Approach

```bash
# Run all tests
bun test

# Watch mode for development
bun test:watch

# Test specific file
bun test src/services/__tests__/openMeteoService.test.ts
```

Test files located alongside source in `__tests__/` directories.
