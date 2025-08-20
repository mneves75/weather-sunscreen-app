# Weather Sunscreen App - Claude Code Guide

## Project Overview

The Weather Sunscreen App is a comprehensive React Native mobile application built with Expo that provides real-time weather information, UV index monitoring, and personalized sunscreen recommendations. The app features custom native modules for enhanced performance, cross-platform compatibility, and a modern UI following platform design guidelines.

**Primary Purpose**: Help users make informed decisions about sun exposure and sunscreen usage based on real-time weather and UV index data.

**Target Platforms**: iOS 16+, Android API 29+, Web (with graceful fallbacks)

## Development Commands

### Essential Commands
```bash
# Start development
npm start                    # Start Expo development server with dev client
npm run ios                  # Build and run on iOS (requires Xcode)
npm run android             # Build and run on Android (uses Java 17)
npm run web                 # Start web development server

# Version and Build Management
npm run sync-versions       # Sync versions across all project files using CHANGELOG.md
npm run sync-versions:dry   # Preview version changes without making them
npm run fix-pods           # Comprehensive CocoaPods cleanup and reinstall
npm run clean-ios          # Quick iOS cleanup (Pods, build, derived data)

# Package Management
npm install                 # Install all dependencies
npx expo install           # Install Expo-compatible versions
```

### Build Commands
```bash
# EAS Build (Production)
npx eas build --platform ios --profile production
npx eas build --platform android --profile production

# Development Builds
npx eas build --platform ios --profile development
npx eas build --platform android --profile development
```

### Troubleshooting Commands
```bash
# iOS Issues
npm run fix-pods           # Fix CocoaPods, clear cache, reinstall
npm run clean-ios         # Quick cleanup for build issues
rm -rf ios/Pods ios/Podfile.lock && cd ios && pod install

# Android Issues
./android/gradlew clean    # Clean Android build
rm -rf node_modules && npm install  # Clean dependency issues

# General Reset
npm run sync-versions && npm install  # Sync and reinstall
```

## Architecture Guidelines

### Code Organization Principles

1. **Feature-Based Structure**: Organize by features, not file types
2. **Separation of Concerns**: Clear distinction between UI, business logic, and data layers
3. **Type Safety**: Strict TypeScript usage throughout the application
4. **Platform Abstraction**: Native modules with web fallbacks

### Directory Structure Guidelines

- **`src/components/`**: Reusable UI components organized by type
  - `ui/`: Common UI elements (buttons, loading, error states)
  - `icons/`: Icon components for navigation and UI
  - `native/`: Platform-specific component wrappers
  
- **`src/context/`**: React Context providers for state management
- **`src/navigation/`**: Navigation configuration and screen components
- **`src/services/`**: Business logic, API calls, and data processing
- **`src/types/`**: TypeScript type definitions and interfaces

- **`modules/`**: Custom native modules with platform implementations
- **`scripts/`**: Build and development automation scripts
- **`docs/`**: Technical documentation and guides

### State Management Pattern

**Primary**: React Context with useReducer for complex state
**Storage**: AsyncStorage for persistence (when needed)
**Caching**: 10-minute cache for weather data to reduce API calls
**Error Handling**: Comprehensive error boundaries and fallback states

## Native Module Usage

### Weather Native Module

**Purpose**: High-performance location services and weather data fetching

**Key Features**:
- GPS location with CoreLocation (iOS) and LocationManager (Android)
- Weather API integration with proper error handling and timeouts
- UV index calculations with solar position algorithms
- Background processing with efficient resource management

**Usage Examples**:
```typescript
// Check availability
const available = await WeatherNativeService.isAvailable();

// Get current location
const location = await WeatherNativeService.getCurrentLocation();

// Fetch weather data
const weather = await WeatherNativeService.getWeatherData(lat, lon);

// Get UV index with recommendations
const uvData = await WeatherNativeService.getUVIndexData(lat, lon);
```

**Fallback Strategy**:
- iOS 16+: Native WeatherKit integration
- Android API 29+: Custom Java implementation with modern APIs
- Web/Older devices: Expo Location services with mock weather data
- Error scenarios: Graceful degradation to cached or default data

### Development Integration

**File Locations**:
- TypeScript interface: `modules/weather-native-module/index.ts`
- iOS implementation: `modules/weather-native-module/ios/WeatherNativeModule.swift`
- Android implementation: `modules/weather-native-module/android/WeatherNativeModule.java`

**Testing Native Modules**:
```bash
# Test iOS native functionality
npm run ios
# Check Xcode console for native module logs

# Test Android native functionality  
npm run android
# Check logcat for native module logs: adb logcat | grep WeatherNative
```

## Common Development Tasks

### Adding New Screens
1. Create screen component in `src/navigation/screens/`
2. Add route to navigation configuration in `src/navigation/index.tsx`
3. Update TypeScript navigation types in `src/types/navigation.ts`
4. Create corresponding icon component if needed

### Implementing New Weather Features
1. Add type definitions to `src/types/weather.ts`
2. Extend native module interface in `modules/weather-native-module/index.ts`
3. Implement native functionality in platform-specific files
4. Update `WeatherService` class with new methods
5. Add UI components and integrate with existing screens

### Managing App Configuration
- **Core config**: `app.json` for Expo configuration
- **Build config**: `eas.json` for EAS Build settings
- **Version sync**: Use `npm run sync-versions` after updating CHANGELOG.md
- **Dependencies**: Use `npx expo install` for Expo-compatible versions

### Debugging Weather Data Issues
1. Check network connectivity and permissions
2. Verify API endpoints in `app.json` extra configuration
3. Review native module logs for iOS/Android specific issues
4. Test fallback mechanisms by simulating failures
5. Use development tools to inspect state and context values

## Troubleshooting

### iOS-Specific Issues
- **CocoaPods problems**: Run `npm run fix-pods` for comprehensive cleanup
- **Xcode build errors**: Check iOS deployment target (16.0+) and Swift version
- **Location permissions**: Verify Info.plist entries and runtime permission flow
- **WeatherKit issues**: Ensure proper Apple Developer Program membership

### Android-Specific Issues
- **Java version conflicts**: Script automatically uses Java 17
- **Gradle build problems**: Clean gradle cache and rebuild
- **Location permissions**: Check AndroidManifest.xml and runtime permissions
- **Native module crashes**: Review logcat output for detailed error messages

### Cross-Platform Issues
- **Navigation type errors**: Update `src/types/navigation.ts` after route changes
- **Weather service failures**: Check internet connectivity and API rate limits
- **Performance issues**: Review component re-renders and context usage
- **Cache problems**: Clear weather service cache with `WeatherService.clearCache()`

### Development Environment
- **Node.js**: Ensure version 18+ is installed
- **Expo CLI**: Keep updated to latest version
- **Development builds**: Use `npx eas build` with development profile
- **Simulator/Emulator**: Test on both iOS simulator and Android emulator

## Performance Optimization

### Weather Data Management
- Implement 10-minute caching to reduce API calls
- Use background refresh for seamless user experience
- Optimize location requests to balance accuracy and battery usage
- Cache location-based data to reduce repeated geocoding

### UI/UX Performance
- Use React.memo for expensive weather display components
- Implement proper dependency arrays in useCallback/useMemo
- Lazy load forecast data and detailed weather information
- Optimize image assets and use appropriate formats

### Native Module Efficiency
- Implement proper timeout handling (10-second default)
- Use background threads for heavy computations
- Handle memory management in platform-specific code
- Provide meaningful error messages and fallback strategies

### For every implementation
- After implementing something I want you to go through each change you made and cross-check it against my prompts. Did you do everything perfectly? Have you made any mistakes? carefully read over all of the new code you just wrote and other existing code you just modified with "fresh eyes," looking super carefully for any obvious bugs, errors, problems, issues, confusion, etc. ultra think 

---

This guide provides comprehensive information for developing and maintaining the Weather Sunscreen App. For additional help, refer to the project documentation in `docs/` directory or check the troubleshooting section in `README.md`.