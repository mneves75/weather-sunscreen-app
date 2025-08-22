# Weather Sunscreen App - Claude Code Guide

## Project Overview

The Weather Sunscreen App is a comprehensive React Native mobile application built with Expo that provides real-time weather information, UV index monitoring, and personalized sunscreen recommendations. The app features custom native modules for enhanced performance, cross-platform compatibility, and a modern UI following platform design guidelines.

**Current Version**: 1.0.1 (August 22, 2025)  
**Primary Purpose**: Help users make informed decisions about sun exposure and sunscreen usage based on real-time weather and UV index data.  
**Target Platforms**: iOS 16+, Android API 29+, Web (with graceful fallbacks)

## Development Commands

### Essential Commands

**Note**: This project prefers Bun over npm for better performance and modern JavaScript tooling.

```bash
# Start development (prefer bun)
bun start                    # Start Expo development server with dev client
bun run ios                  # Build and run on iOS (requires Xcode)
bun run android             # Build and run on Android (uses Java 17)
bun run web                 # Start web development server

# Fallback npm commands (if bun unavailable)
npm start                    # Start Expo development server with dev client
npm run ios                  # Build and run on iOS (requires Xcode)
npm run android             # Build and run on Android (uses Java 17)
npm run web                 # Start web development server

# Version and Build Management
bun run sync-versions       # Sync versions across all project files using CHANGELOG.md
bun run sync-versions:dry   # Preview version changes without making them
bun run fix-pods           # Comprehensive CocoaPods cleanup and reinstall
bun run clean-ios          # Quick iOS cleanup (Pods, build, derived data)

# Package Management (prefer bun)
bun install                 # Install all dependencies (faster than npm)
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
bun run fix-pods           # Fix CocoaPods, clear cache, reinstall
bun run clean-ios         # Quick cleanup for build issues
rm -rf ios/Pods ios/Podfile.lock && cd ios && pod install

# Android Issues
./android/gradlew clean    # Clean Android build
rm -rf node_modules && bun install  # Clean dependency issues

# General Reset
bun run sync-versions && bun install  # Sync and reinstall
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
**Storage**: AsyncStorage for persistence (with validation)
**Caching**: 10-minute cache for weather data to reduce API calls
**Error Handling**: Comprehensive error boundaries and fallback states

## Logging and Error Handling (v1.0.1+)

### Production Logging Service

**IMPORTANT**: Never use `console.log`, `console.warn`, or `console.error` directly. Always use the LoggerService.

```typescript
import { logger } from '../services/loggerService';

// Use structured logging instead of console
logger.info('Weather data loaded', { location: 'New York' });
logger.warn('API rate limit approaching', { remaining: 10 });
logger.error('Failed to fetch weather', error, { url: apiUrl });

// Convenience methods for common patterns
logger.apiCall('GET', '/weather', { lat, lon });
logger.apiSuccess('GET', '/weather', 250); // duration in ms
logger.apiError('GET', '/weather', error);
logger.userAction('refreshWeather', { source: 'pull-to-refresh' });
```

### Error Boundary Usage

The app includes a comprehensive error boundary at the root level. For component-specific error handling:

```typescript
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

// Wrap components that might fail
<ErrorBoundary fallback={<CustomErrorUI />}>
  <RiskyComponent />
</ErrorBoundary>
```

### Memory Management Best Practices

- **Always use cleanup in useEffect**: Implement proper cleanup for timers and subscriptions
- **Track component mount state**: Use `isMounted` flags for async operations
- **Clear timeouts properly**: Store timeout IDs and clear them in cleanup functions
- **Validate data before storage**: Check required fields before AsyncStorage operations

## TypeScript Conventions

### Compiler Configuration
- **Config**: `tsconfig.json` with `strict: true` and `moduleResolution: bundler`
- **Base**: Extends `expo/tsconfig.base` for optimal Expo compatibility

### Type Safety Best Practices
- **Explicit function signatures** on all exports and public APIs
- **Avoid `any` types**; model domain types in `src/types/weather.ts`, `src/types/navigation.ts`
- **Narrow error handling** with typed errors and proper error boundaries
- **Strict null checks** and proper optional chaining throughout

### Import Organization
- **Absolute imports** from `src/` where practical for cleaner paths
- **Keep native module imports** isolated to service layer for better abstraction
- **Import grouping**: React first, then third-party libraries, then local imports (alphabetical within groups)

### Code Style Guidelines
- **Control flow**: Use guard clauses and early returns to minimize nesting
- **Formatting**: Match existing code style; prefer multi-line readability over complex one-liners
- **Naming conventions**: Use descriptive names; avoid abbreviations unless widely understood
- **Function organization**: Pure functions preferred, with clear input/output types

### Weather App Specific Types
- **Weather data types**: Defined in `src/types/weather.ts`
- **Location types**: GPS coordinates, address data, permission states
- **UV index types**: UV levels, recommendations, skin type classifications
- **Sunscreen types**: SPF levels, application tracking, timer states

## Component Patterns

### Component Structure
- **Functional components** with TypeScript interfaces for props
- **React hooks** for state management and side effects
- **React.memo** for performance optimization of expensive weather display components
- **Custom hooks** for reusable weather data logic

### Component Categories

#### Screen Components (`src/navigation/screens/`)
- **Purpose**: Top-level screen containers with navigation integration
- **Structure**: Handle navigation, context consumption, and screen-level state
- **Examples**: `WeatherScreen.tsx`, `UVIndexScreen.tsx`, `ForecastScreen.tsx`, `SunscreenTrackerScreen.tsx`

#### UI Components (`src/components/ui/`)
- **Purpose**: Reusable interface elements across the app
- **Structure**: Props-based, stateless where possible, with clear TypeScript interfaces
- **Examples**: Buttons, loading indicators, error states, cards

#### Icon Components (`src/components/icons/`)
- **Purpose**: SVG-based icons for navigation and UI elements
- **Structure**: Accept `size`, `color`, and standard View props
- **Usage**: Custom icons for weather conditions, UV levels, navigation tabs

#### Glass Components (`src/components/glass/`)
- **Purpose**: Liquid glass UI effect components for modern visual design
- **Structure**: Platform-aware styling with performance optimization
- **Usage**: Background effects, card overlays, premium visual elements

### State Management in Components
- **Context consumption**: Use weather and sunscreen contexts appropriately
- **Local state**: Prefer `useState` for simple component state
- **Side effects**: Use `useEffect` with proper dependency arrays
- **Error boundaries**: Implement error handling at appropriate component levels

### Performance Patterns
- **Memoization**: Use `React.memo` for components that render frequently with weather data
- **Callback optimization**: Use `useCallback` and `useMemo` with proper dependencies
- **Lazy loading**: Implement code splitting for forecast and detailed weather views
- **Image optimization**: Use appropriate image formats and sizes for weather icons

## Security and Privacy Guidelines

### Data Protection
- **Location data**: Handle GPS coordinates securely, avoid unnecessary storage
- **API keys**: Store sensitive keys in secure configuration, never in source code
- **User preferences**: Encrypt sensitive user data in AsyncStorage when required
- **Cache management**: Implement secure cache invalidation and cleanup

### Network Security
- **HTTPS enforcement**: All weather API calls must use secure connections
- **Input validation**: Validate all user inputs and API responses
- **Error handling**: Avoid exposing sensitive information in error messages
- **Rate limiting**: Implement appropriate delays and retry logic for API calls

### Platform Security
- **iOS**: Proper keychain usage for sensitive data, permission handling
- **Android**: Secure SharedPreferences, proper permission declarations
- **Native modules**: Input validation and secure communication between JS and native code

### Privacy Compliance
- **Location permissions**: Clear user consent and purpose explanation
- **Data minimization**: Only collect and store necessary weather data
- **Transparency**: Clear privacy policy about data usage and third-party services
- **User control**: Provide options to clear cached data and revoke permissions

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

## Weather-Specific Development Patterns

### Weather Data Management
- **Caching Strategy**: Implement 10-minute cache for weather data to balance freshness with API limits
- **Background Refresh**: Use appropriate background tasks for weather updates
- **Data Validation**: Validate all weather API responses and handle incomplete data gracefully
- **Unit Conversion**: Support both metric and imperial units with user preferences

### Location Handling
- **Permission Flow**: Request location permissions with clear user benefit explanation
- **Accuracy Management**: Balance GPS accuracy with battery usage for weather location
- **Fallback Strategy**: Handle location failures with manual city selection or cached locations
- **Geocoding**: Implement reverse geocoding for user-friendly location display

### UV Index Integration
- **Real-time Calculations**: Combine weather data with solar position algorithms for accurate UV levels
- **Skin Type Support**: Personalize UV recommendations based on user skin type
- **Time-based Recommendations**: Provide UV safety advice based on current and future conditions
- **Alert System**: Implement appropriate warnings for high UV exposure periods

### Sunscreen Tracking Features
- **Application Timers**: Track sunscreen application and reapplication reminders
- **SPF Calculations**: Calculate protection time based on UV index and SPF level
- **Usage Analytics**: Provide insights on sunscreen usage patterns
- **Historical Data**: Store and display sunscreen application history

### Performance Considerations
- **Weather Icons**: Optimize weather condition icons with appropriate caching
- **Forecast Data**: Implement lazy loading for extended forecast information
- **Native Modules**: Use native weather modules for performance-critical operations
- **Memory Management**: Proper cleanup of weather data subscriptions and timers

### Error Handling Patterns
- **Network Failures**: Graceful degradation to cached weather data
- **API Errors**: User-friendly error messages without exposing technical details
- **Location Errors**: Clear guidance for location permission and GPS issues
- **Sync Failures**: Robust retry mechanisms with exponential backoff

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
- **Version sync**: Use `bun run sync-versions` after updating CHANGELOG.md
- **Dependencies**: Use `npx expo install` for Expo-compatible versions or `bun install` for general packages

### Debugging Weather Data Issues
1. Check network connectivity and permissions
2. Verify API endpoints in `app.json` extra configuration
3. Review native module logs for iOS/Android specific issues
4. Test fallback mechanisms by simulating failures
5. Use development tools to inspect state and context values

## Troubleshooting

**⚠️ CRITICAL: For React Native 0.81.0 + Expo 54.0.0-preview.4 Issues**
See `docs/know-issues.md` for comprehensive solutions to known compatibility issues including:
- ReactNativeDependencies pod installation failures
- React Native Fabric header path resolution errors
- Auto-generated file modification challenges

### Essential Commands for Clean Builds
```bash
# Complete iOS setup from scratch (recommended after git clone)
bun install
cd ios && rm -rf Pods Podfile.lock && pod install
../scripts/fix-fabric-headers.sh
cd .. && bun run ios

# Fix header issues only
cd ios && ../scripts/fix-fabric-headers.sh

# Fix ReactNativeDependencies issues
cd ios && ../scripts/patch-react-native-deps.sh && pod install
```

### iOS-Specific Issues
- **CocoaPods problems**: Run `bun run fix-pods` for comprehensive cleanup
- **ReactNativeDependencies failures**: Use `scripts/patch-react-native-deps.sh` for preview version compatibility
- **Header not found errors**: Run `scripts/fix-fabric-headers.sh` to create required symlinks for New Architecture
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
- **Node.js/Bun**: Ensure Node.js 18+ or Bun 1.0+ is installed (prefer Bun)
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