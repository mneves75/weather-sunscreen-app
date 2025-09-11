# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Weather Sunscreen App - React Native (Expo) mobile app providing real-time weather, UV index monitoring, and personalized sunscreen recommendations.

- **Stack**: React Native 0.81.4, Expo SDK ~54.0.0 (stable), TypeScript 5.9.2
- **React**: 18.3.1 (downgraded from 19.1.0 for SDK 54 compatibility)
- **Platforms**: iOS 16+, Android API 29+, Web
- **New Architecture**: Enabled (Fabric + TurboModules)
- **Package Manager**: Bun (preferred) or npm fallback

## Essential Commands

```bash
# Development
bun start                    # Start Expo dev server
bun run ios                  # Run on iOS (auto-selects simulator)
bun run android              # Run on Android (Java 17 configured)
bun run web                  # Run web version

# Testing
npm test                     # Run Jest tests (use npm, not bun for Jest)
npm test -- --watch          # Watch mode
npm test -- path/to/test     # Run specific test file
bun run lint                 # ESLint check
bun run typecheck            # TypeScript validation

# Build & Deploy
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
npx eas submit --platform ios  # Submit to App Store

# iOS Native Development
cd ios && pod install --repo-update  # Install/update CocoaPods
xcodebuild test -scheme WeatherSunscreen  # Run native iOS tests
scripts/fix-fabric-headers.sh  # Fix React Native header issues
bun run fix-pods             # Complete CocoaPods cleanup
bun run clean-ios            # Quick iOS cleanup

# Version Management
bun run sync-versions        # Sync version from CHANGELOG.md to all files
bun run sync-versions:dry    # Preview version changes

# E2E Testing (Maestro)
npx maestro test maestro/flows/ios-launch.yaml
npx maestro test maestro/flows/liquid-glass-and-theme.yaml
```

## High-Level Architecture

### Core Architecture Patterns

**Navigation**: Expo Router v4 (file-based routing)

- `app/_layout.tsx` - Root layout with providers
- `app/(tabs)/` - Main tabbed navigation
- `app/(dev)/` - Developer-only routes for testing

**State Management**: Context + Reducer pattern

- WeatherContext: Weather data, location, loading states
- SunscreenContext: UV index, SPF recommendations
- ThemeContext: Dark/light mode, color schemes
- All contexts use useReducer for complex state management

**Native Integrations**

- Weather module: `WeatherNativeService` (TurboModule with fallbacks)
- Liquid Glass UI: Official Expo module `expo-glass-effect` (`GlassView`). No custom native module is used.
- Graceful fallbacks when running in Expo Go or web

### Critical Service Patterns

**LoggerService** (`src/services/loggerService.ts`)

- Structured logging with environment awareness
- Production: Only warn/error levels
- Development: Full debug logging
- API: `logger.info()`, `logger.warn()`, `logger.error()`
- Never use console.log/warn/error directly

**Weather Data Flow**:

1. WeatherNativeService attempts native module (iOS: WeatherKit, Android: custom)
2. Falls back to OpenMeteoService if unavailable
3. 10-minute cache per location (lat/lon key)
4. Concurrent request deduplication
5. Sanitized error messages for security

**Error Handling Strategy**:

- ErrorHandler utility with severity levels (CRITICAL, IMPORTANT, OPTIONAL)
- Input validation on all native module interfaces
- Fallback data for network failures
- Error boundaries at screen level

## SDK 54 & New Architecture Status

### Configuration Details

- **New Architecture**: Enabled via `newArchEnabled: true` in app.json
- **Podfile**: `ENV['RCT_NEW_ARCH_ENABLED'] = '1'`
- **Android**: `newArchEnabled=true` in gradle.properties
- **iOS builds**: Use precompiled React Native for 40% faster builds
- **Codegen**: Automatically generates native bindings from TypeScript specs

### iOS 26 Support

- Baseline simulator runtime: iOS 26.0 (17A321)

- Deployment target: iOS 16.0 (production), iOS 26.0 (development)
- Liquid Glass native module with iOS 26 APIs
- Memory-safe implementation with weak references
- Motion tracking throttled to 10Hz (83% battery savings)
- EAS build image: `macos-sequoia-15.6-xcode-26.0` for all lanes

### Android API 36

- compileSdkVersion: 36
- targetSdkVersion: 36
- Edge-to-edge display enabled by default
- Predictive back gesture support available

## Testing Infrastructure

### Jest Configuration

- Uses npm/yarn for Jest (Bun test runner incompatible)
- Flow type support via babel plugins
- Transform configuration handles React Native imports
- Global **DEV** variable properly defined
- Mocks for Expo modules in jest.setup.ts

### Test Organization

- Unit tests in `__tests__/` directories alongside source
- Native module tests in `modules/*/tests/`
- E2E tests with Maestro in `maestro/flows/`
- Security tests in iOS native test suite

### Running Tests

```bash
# All tests
npm test

# Specific patterns
npm test -- --testNamePattern="LiquidGlass"
npm test -- modules/weather-native-module

# Coverage
npm test -- --coverage

# Native iOS tests
cd ios && xcodebuild test -scheme WeatherSunscreen
```

## Native Module Development

### Weather Native Module

- **Location**: `modules/weather-native-module/`
- **TypeScript Spec**: `src/specs/NativeWeatherModule.ts`
- **Key Methods**:
  - `isAvailable()`: Check platform support
  - `getCurrentLocation()`: Get GPS coordinates
  - `getWeatherData(lat, lon)`: Fetch weather with caching
  - `calculateUVIndex(lat, lon, timestamp?)`: UV calculations

### Liquid Glass

- Liquid Glass is implemented with `expo-glass-effect` and does not require custom native code.
- Usage:
  - `import { GlassView } from 'expo-glass-effect'`
  - `<GlassView glassEffectStyle="regular">...</GlassView>`

### Adding New Native Modules

1. Create TypeScript spec in `src/specs/`
2. Implement native code in `modules/[name]/ios/` and `/android/`
3. Export service wrapper with fallbacks
4. Add tests with mocked native module
5. Run codegen: `cd ios && pod install`

## Performance Considerations

### Caching Strategy

- Weather data: 10-minute cache per location
- Concurrent request deduplication via Map
- AsyncStorage for persistent user preferences
- Memory-safe weak references in iOS modules

### React Optimizations

- React.memo on weather display components
- Proper useCallback/useMemo dependencies
- Mount state tracking for async operations
- Error boundaries prevent cascade failures

### Battery Efficiency

- Motion tracking: 10Hz (reduced from 60Hz)
- Location updates: On-demand only
- Background processing: Disabled
- Network requests: Batched and cached

## Security Requirements

### Implemented Safeguards

- Thread-safe Actor pattern (iOS)
- Input validation on all coordinates
- Sanitized error messages (no coordinates/paths)
- Minimal permissions (location WhenInUse only)
- No force unwrapping in Swift code
- Relative paths in all scripts

### API Security

- HTTPS only for weather APIs
- No API keys in code (use environment variables)
- Request throttling and caching
- Fallback data for offline mode

## Deployment Checklist

### Before Building

1. Run tests: `npm test`
2. Check types: `bun run typecheck`
3. Lint code: `bun run lint`
4. Update version: `bun run sync-versions`
5. Update CHANGELOG.md with all changes

### iOS Production Build

```bash
cd ios && pod install --repo-update
npx eas build --platform ios --profile production
npx eas submit --platform ios
```

### Android Production Build

```bash
npx eas build --platform android --profile production
npx eas submit --platform android
```

### Post-Deployment

- Monitor crash reports in Sentry/Crashlytics
- Check performance metrics
- Verify WeatherKit entitlement (iOS)
- Test on various device types

## Development Tips

### Structural Code Search

Use ast-grep for syntax-aware searches instead of text-based grep:

```bash
sg --lang ts -p 'const $VAR = useContext($CTX)'  # Find all useContext calls
sg --lang tsx -p '<$COMP $$$PROPS/>'              # Find component usage
```

### Conventional Commits

Required format for all commits (enforced by commitlint + husky):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style (formatting, semicolons, etc)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## Common Issues & Solutions

### Jest Test Failures

- Use `npm test` not `bun test`
- Check babel configuration for Flow types
- Ensure **DEV** is defined in jest.setup.ts

### iOS Build Issues

- Run `scripts/fix-fabric-headers.sh` for header errors
- Use `bun run fix-pods` for CocoaPods issues
- Check Xcode version (16+ recommended)

### Android Build Issues

- Ensure Java 17 is configured
- Check gradle.properties for newArchEnabled=true
- Clear gradle cache if needed

### Native Module Not Found

- Running in Expo Go? Use development build
- Check pod installation for iOS
- Verify module registration in native code
