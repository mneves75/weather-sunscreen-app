# Weather Sunscreen App ☀️

> **Your comprehensive weather companion with UV index monitoring and sunscreen recommendations**  
> **Version 2.0.0** - Simpler navigation (Expo Router), clearer UI wrappers, stronger tests  
> **Security Status: ✅ PASSED** - All critical vulnerabilities fixed (2025-09-09)

A modern React Native mobile application built with Expo that provides real-time weather information, UV index monitoring, and personalized sunscreen recommendations to help you stay safe in the sun.

## 🌟 Features

### Core Features

- **Real-time Weather Data** - Current conditions, temperature, humidity, wind speed, and more
- **UV Index Monitoring** - Live UV index with safety level indicators and peak time predictions
- **Sunscreen Recommendations** - Personalized SPF recommendations based on UV levels and skin type
- **7-Day Forecast** - Extended weather forecast with daily UV index predictions
- **Location Services** - Automatic location detection with manual location selection
- **Cross-Platform** - Native iOS, Android, and web support
- **Modern UI** - Clean, intuitive interface following platform design guidelines
- **Native Performance** - Custom native modules for enhanced speed and accuracy

### 🆕 v1.0.1 Enhancements

- **Production-Ready Logging** - Structured logging system with environment-aware levels
- **Error Recovery** - App-level error boundaries with user-friendly recovery options
- **Performance Optimizations** - React.memo optimizations reducing unnecessary re-renders
- **Memory Management** - Enhanced cleanup preventing memory leaks in background timers
- **Type Safety** - Comprehensive TypeScript improvements preventing runtime errors
- **Data Security** - Enhanced validation for user data storage operations
- **WMO Weather Standards** - Consistent weather icon system using international standards

### 🔒 Security (2025-09-09)

- **Thread Safety** - Actor-based concurrency for all iOS native modules
- **Memory Safety** - Zero memory leaks with proper lifecycle management
- **Permission Model** - Minimal location permissions (WhenInUse only)
- **Input Validation** - All coordinates and user inputs validated
- **Error Handling** - Sanitized error messages without implementation details
- **Battery Efficiency** - Motion tracking reduced from 60Hz to 10Hz (83% savings)
- **Test Coverage** - Comprehensive security test suite with 14 test cases
- **Build Security** - No hardcoded paths, all scripts use relative paths

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun 1.0+ (Bun recommended for better performance)
- Expo CLI installed globally: `npm install -g @expo/cli`
- For iOS development: Xcode 16+ with iOS 16+ SDK (baseline simulator runtime: iOS 26.0 (17A321))
- For Android development: Android Studio with Java 17
- An iOS device/simulator or Android device/emulator

### Installation

1. **Clone and setup**

   ```bash
   git clone https://github.com/mneves75/weather-sunscreen-app.git
   cd weather-suncreen-app

   # Using Bun (recommended)
   bun install

   # Or using npm
   npm install
   ```

2. **Development build setup**

   ```bash
   # Create development build for iOS
   npm run ios

   # Create development build for Android
   npm run android

   # Start development server
   npm start
   ```

3. **Web development**
   ```bash
   npm run web
   ```

## Expo SDK 54 Changelog

- See `docs/expo-sdk-54-changelog.md` for a comprehensive summary of what’s new in SDK 54
  (precompiled RN for iOS, iOS 26 glass via expo-glass-effect, Router v6, CLI improvements, and more).

## End-to-end (E2E) Device Flows (Maestro)

- Prereqs: a simulator/device and Maestro CLI (brew install maestro or see docs).
- iOS launch + smoke: `npx maestro test maestro/flows/ios-launch.yaml`
- Theme + Liquid Glass exercise (no mocks):
  `npx maestro test maestro/flows/liquid-glass-and-theme.yaml`
- Full navigation smoke: `npx maestro test maestro/flows/theme-and-scroll.yaml`

## 🏗️ Architecture

### Technology Stack

- **Framework**: React Native 0.81.0 with Expo SDK 54 Preview
- **Language**: TypeScript 5.9.2 (strict mode enabled)
- **Navigation**: Expo Router v6 (file-based routing)
- **State Management**: React Context + AsyncStorage
- **Logging**: Custom LoggerService with structured logging
- **Error Handling**: React Error Boundaries with recovery options
- **Location Services**: Expo Location + Custom Native Modules
- **Build System**: Expo Development Build with New Architecture (Fabric)
- **Package Manager**: Bun (preferred) or npm
- **Platforms**: iOS 16+, Android API 29+, Web

### Project Structure (simplified)

```
weather-sunscreen-app/
├── app/                         # Expo Router routes (file-based)
│   ├── _layout.tsx              # Root layout/providers
│   ├── (tabs)/                  # Main tabbed UI
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Home
│   │   ├── weather.tsx          # Weather screen
│   │   ├── uv.tsx               # UV Index
│   │   ├── forecast.tsx         # 7-day forecast
│   │   └── settings.tsx         # Profile/Settings
│   └── (dev)/                   # Developer routes
│       ├── icon-gallery.tsx
│       └── glass-gallery.tsx
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Common UI components
│   │   ├── icons/               # SVG icon components
│   │   └── glass/               # Glass wrappers (expo-glass-effect)
│   ├── context/                 # React Context providers
│   ├── services/                # Business logic and API services
│   ├── theme/                   # Theme + AppProviders
│   ├── i18n/                    # Translations (en, pt-BR)
│   └── types/                   # TypeScript type definitions
├── modules/                      # Custom native modules (iOS/Android bridges)
├── scripts/                      # Build and development scripts
├── docs/                         # Technical documentation
└── project-rules/                # Repo automation rules
```

## 📱 Screens

### Weather Screen

Displays current weather conditions including temperature, description, humidity, wind speed, pressure, and visibility with real-time updates.

### UV Index Screen

Shows current UV index with safety level, peak time predictions, and personalized sunscreen recommendations based on current conditions.

### Forecast Screen

Provides 7-day weather forecast with daily UV index predictions and precipitation chances (coming soon).

### Profile Screen

User preferences, settings, and app information including temperature units, skin type, and notification preferences.

## ⚡ Native Modules

### Weather Native Module

Custom native implementations for:

- **Location Services**: High-accuracy GPS location with CoreLocation (iOS) and LocationManager (Android)
- **Weather Data**: Integration with platform-specific weather APIs
- **UV Index**: Real-time UV measurements with solar position calculations
- **Background Processing**: Efficient data fetching with proper timeout handling

**Platform Support:**

- **iOS 16+**: Uses WeatherKit framework and CoreLocation for native performance
- **Android API 29+**: Custom Java implementation with modern Android APIs
- **Web**: Graceful fallback to Expo services with mock data

### Important Notes for Expo SDK 54

- WeatherKit requires enabling the WeatherKit capability for your bundle identifier in the Apple Developer portal. If it’s not enabled or unavailable at runtime, the app automatically falls back to service-based weather and safe mock data, so the UX remains intact.
- Expo Go does not include custom native modules. To use the native WeatherKit bridge, run a Development Build (`expo run:ios` / `expo run:android`) or build with EAS. Liquid Glass UI now uses the official `expo-glass-effect` and works in development builds with graceful fallbacks.

## 🛠️ Development

### Common Commands

```bash
# Development
npm start                    # Start Expo development server
npm run ios                  # Build and run iOS
npm run android             # Build and run Android (with Java 17)
npm run web                 # Start web development

# Version management
npm run sync-versions       # Sync all versions to CHANGELOG.md
npm run sync-versions:dry   # Preview version changes

# Troubleshooting
npm run fix-pods           # Fix CocoaPods issues
npm run clean-ios          # Quick iOS cleanup
```

#### iOS Destination Auto-Select

The `npm run ios` script now auto-selects and boots a valid iOS Simulator before invoking Expo, preventing failures like:

> xcodebuild: error: Unable to find a destination matching the provided destination specifier: { id:… }

Override selection when needed:

```bash
# Explicit simulator
npm run ios -- --simulator "iPhone 16"

# Physical device by name
npm run ios -- --device "iPhone de Marcus"
```

### Environment Setup

**iOS Development:**

- Xcode 15+ (16+ recommended for latest features)
- iOS 16+ deployment target
- CocoaPods for native dependencies

**Android Development:**

- Java 17 (automatically configured in scripts)
- Android SDK 36
- Gradle 8.10.2

### Configuration

**Location Services:**

- iOS: Add location usage descriptions to Info.plist
- Android: Include location permissions in AndroidManifest.xml
- Web: Fallback to browser geolocation API

**API Integration:**

- Weather APIs configured in `app.json` extra section
- Native modules handle API requests with proper error handling
- Fallback data available for development and testing

## 🧪 Testing

### Glass UI & Haptics

- iOS usa UI “Glass” com Expo Blur/LinearGradient por padrão; quando `expo-glass-effect` estiver instalado, os wrappers usam o container nativo automaticamente (iOS 26+). Haptics: ponte nativa quando presente, fallback para `expo-haptics`.
- Visual rápido em dev (Expo Router):
  - (dev)/glass-gallery
  - (dev)/icon-gallery

### Development Testing

```bash
npm run ios     # Test iOS functionality
npm run android # Test Android functionality
npm run web     # Test web compatibility
```

### Feature Flags & Diagnostics

- Liquid Glass native path on iOS < 26 (dev/test only):
  - JS flag: set `LIQUID_GLASS_PRE_IOS26=1` or `global.__DEV_LIQUID_GLASS_PRE_IOS26__ = true` before module load.
  - Native (Swift) flag: set `LIQUID_GLASS_FORCE_ENABLE=1` (Xcode Scheme/EAS env) or `UserDefaults` key `LIQUID_GLASS_FORCE_ENABLE = true`.
  - Use for validating native paths before iOS 26 ships.

- Production diagnostics (warn/error only):
  - Set `PROD_DIAGNOSTICS=1` (or `global.__PROD_DIAGNOSTICS__ = true`).
  - In app bootstrap, register sink: `attachDiagnosticsSink()` from `src/services/diagnosticsSink`.
  - Retrieve logs with `getBufferedLogs()`; upload on demand; `clearBufferedLogs()` when done.

### Location Services Testing

- Test with location permissions granted/denied
- Verify GPS accuracy and fallback mechanisms
- Test offline behavior with cached data

### Weather Data Testing

- Verify API integration and error handling
- Test UV index calculations and recommendations
- Validate sunscreen advice for different skin types

## 📦 Building and Deployment

### Development Builds

```bash
# iOS development build
npx eas build --platform ios --profile development

# Android development build
npx eas build --platform android --profile development
```

### Production Builds

```bash
# iOS App Store
npx eas build --platform ios --profile production

# Android Play Store
npx eas build --platform android --profile production
```

### App Store Submission

1. Configure signing certificates in EAS
2. Update app icons and splash screens
3. Submit via EAS Submit or manually through store consoles

## 🔧 Troubleshooting

### Common Issues

**iOS Build Failures:**

```bash
npm run fix-pods              # Fix CocoaPods issues
npm run clean-ios            # Clean build artifacts
```

**Location Permission Issues:**

- Check app.json permissions configuration
- Verify platform-specific permission requests
- Test permission flow in app settings

**Weather Data Not Loading:**

- Check internet connectivity
- Verify API endpoints in configuration
- Review native module error logs

**Performance Issues:**

- Clear app cache and restart
- Check for location service conflicts
- Verify memory usage in development tools

### Debug Logging

Enable debug logging by setting `__DEV__` flag:

- Native module operations are logged with detailed error messages
- Weather service calls include timing and success/failure status
- Location requests show accuracy and source information

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For support, feature requests, or bug reports, please create an issue on the project repository.

---

**Built with ❤️ using React Native, Expo, and modern mobile development practices**
