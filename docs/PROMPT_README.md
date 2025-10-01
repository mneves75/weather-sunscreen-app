# Weather Sunscreen App ☀️

> **Your comprehensive weather companion with UV index monitoring and sunscreen recommendations**  
> **Version 3.0.0** - Expo SDK 54 (stable), iOS 26 support, New Architecture enabled  
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
- **Native Performance** - TurboModules onde faz sentido; abas usam Liquid Glass nativo no iOS 26, Material You no Android (Expo Router v6)
- **Previsão Detalhada** - Navegação aprofundada com Expo Router v6 e pré-visualizações de cada dia da semana
- **Localização Completa** - Interface traduzida para inglês e português brasileiro, com alternância dinâmica nas Configurações

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
   bun run ios

   # Create development build for Android
   bun run android

   # Start development server
   bun start
   ```

3. **Web development**
   ```bash
   bun run web
   ```

Full guide: see docs/build.md.

## Expo SDK 54 Documentation

- See `docs/EXPO_SDK_54_MIGRATION.md` for migration guide and SDK 54 features
- See `docs/liquid-glass.md` for iOS 26 Liquid Glass implementation details
  - As configurações específicas de build (`bundleIdentifier`, entitlements e ajustes de deployment target) moram agora somente nos projetos nativos; o `app.json` permanece limpo para evitar divergências durante EAS Build.
  - `npx expo-doctor` alerta sobre propriedades em `app.json` não sincronizarem quando `ios/` e `android/` estão versionados. Mantemos `expo-build-properties` apenas como referência; replique quaisquer alterações diretamente nos projetos nativos.

## 🔄 OTA Updates (EAS Update)

- App is configured for EAS Update:
  - `runtimeVersion: { policy: "appVersion" }`
  - `updates.checkAutomatically: "ON_LOAD"`
  - `updates.url: https://u.expo.dev/org.mvneves.weathersunscreen`
  - `extra.eas.projectId: org.mvneves.weathersunscreen`
  - Replace the placeholder slug URL with your real EAS project UUID before shipping OTA updates (see `docs/known-issues.md`).

## End-to-end (E2E) Device Flows (Maestro)

- Prereqs: a simulator/device and Maestro CLI (brew install maestro or see docs).
- iOS launch + smoke: `npx maestro test maestro/flows/ios-launch.yaml`
- Theme + Liquid Glass exercise (no mocks):
  `npx maestro test maestro/flows/liquid-glass-and-theme.yaml`
- Full navigation smoke: `npx maestro test maestro/flows/theme-and-scroll.yaml`
- Native tabs + Perf overlay: toggle Quick Actions menus and enable the Perf overlay via Settings before exiting.

## 🏗️ Architecture

### Technology Stack

- **Framework**: React Native 0.81.4 with Expo SDK 54 (stable)
- **Language**: TypeScript 5.9.2 (strict mode enabled)
- **Navigation**: Expo Router v6 (file-based routing with NativeTabs + Link previews)
- **UI Experiments**: Optional Material 3 components via Expo UI (`material3Enabled` flag, dev-build only)
- **State Management**: React Context + AsyncStorage; React Query para cache de clima/previsão
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
│   ├── (tabs)/                  # Main tabbed UI (feature-flagged NativeTabs)
│   │   ├── _layout.tsx          # Switches between NativeTabs & legacy Tabs
│   │   ├── (home)/              # Primary content tabs
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx        # Dashboard/Home
│   │   │   ├── weather.tsx      # Detailed weather view
│   │   │   ├── uv.tsx           # UV insights
│   │   │   └── forecast.tsx     # 7-day forecast
│   │   ├── (messages)/          # Messaging placeholder (awaiting scope)
│   │   │   └── _layout.tsx + index.tsx
│   │   └── (styles)/            # Personalization & settings (+ Material 3 flag toggle)
│   │       └── settings.tsx
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

### Messages (Placeholder)

Route reserved for future messaging/notification hub. Currently displays localized placeholder text while product scope finalizes (target decision: September 26, 2025).

### Profile & Styles Screen

User preferences, theme controls, and developer toggles (perf overlay, Material 3 experiments).

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
bun start                     # Start Expo development server (dev client)
bun run ios                   # Build and run iOS (auto-selects simulator)
bun run android               # Build and run Android (Java 17)
bun run web                   # Start web development

# Version management
bun run sync-versions         # Sync all versions to CHANGELOG.md
bun run sync-versions:dry     # Preview version changes

# Troubleshooting (iOS)
bun run fix-pods              # Fix CocoaPods issues
bun run clean-ios             # Quick iOS cleanup
```

#### iOS Destination Auto-Select

The `bun run ios` script now auto-selects and boots a valid iOS Simulator before invoking Expo, preventing failures like:

> xcodebuild: error: Unable to find a destination matching the provided destination specifier: { id:… }

Override selection when needed:

```bash
# Explicit simulator
bun run ios -- --simulator "iPhone 16"

# Physical device by name
bun run ios -- --device "iPhone de Marcus"
```

### Environment Setup

**iOS Development:**

- Xcode 16+ (26.0 simulators recommended)
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

## 🎨 Theming

- Single theme provider: `src/theme/theme.tsx`.
- Hook: `useTheme()` returns `{ themeMode, setThemeMode, toggleTheme, scheme, isDark, highContrast, setHighContrast, colors }`.
- Colors source: tokens in `src/theme/tokens.ts`.
- Convenience: `useColors()` returns `colors` only.
- Persisted preference: `themeMode` persists to AsyncStorage (`@WeatherSunscreen:themeMode`).

Usage example:

```tsx
import { useTheme, useColors } from '@/theme/theme';

function Example() {
  const { themeMode, toggleTheme, highContrast, setHighContrast } = useTheme();
  const colors = useColors();
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Button onPress={toggleTheme} label={`Mode: ${themeMode}`} />
      <Switch value={highContrast} onValueChange={setHighContrast} />
    </View>
  );
}
```

## 🧪 Testing

### Test runner

- Run tests with Jest: `npm test`
- Watch mode: `npm test -- --watch`
- Suites importantes:
  - `npm test -- LiquidGlassWrapper`
  - `npm test -- navigationStyles`
  - `npm test -- weather-theme`
  - `npm test -- forecast-details`
  - `npm test -- localization-smoke`

### Glass UI & Haptics

- iOS “Glass” uses `expo-glass-effect` on iOS 26+ with graceful fallbacks on older iOS/Android/Web.
- Quick visual routes (Expo Router):
  - (dev)/glass-gallery
  - (dev)/icon-gallery

### Development Testing

```bash
bun run ios     # Test iOS functionality
bun run android # Test Android functionality
bun run web     # Test web compatibility
```

## 🚀 Desempenho

- Listas grandes usam `@shopify/flash-list` nas telas Home e Forecast para reduzir jank conforme recomendado em [Best practices for reducing lag in Expo apps](https://expo.dev/blog/best-practices-for-reducing-lag-in-expo-apps).
- Componentes de linha (forecast) foram memorizados com `React.memo` e dados reaproveitados via `src/data/mockForecast.ts` para minimizar renderizações.
- Utilize `npx expo start --no-dev --minify` ou builds Release para validar métricas reais antes de publicar.

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

### Local Release Scripts

- `bun run ios:release` – wraps `scripts/build-ios-release.sh`, expects Xcode 16.4+, simulator runtime iOS 26, and (optional) `DEVICE`/`UDID` overrides.
- `bun run android:release` – wraps `scripts/build-android-release.sh`, requires `JAVA_HOME=/opt/homebrew/opt/openjdk@17/...` in the environment.
- `bun run android:aab` – generates a Play-ready App Bundle via Gradle (`./gradlew bundleRelease`).

See `docs/BUILD.md` for the full build matrix, prerequisites, and troubleshooting tips.

### App Store Submission

1. Configure signing certificates in EAS
2. Update app icons and splash screens
3. Submit via EAS Submit or manually through store consoles

## 🔧 Troubleshooting

### Common Issues

**iOS Build Failures:**

```bash
bun run fix-pods              # Fix CocoaPods issues
bun run clean-ios             # Clean build artifacts
```

- **Expo Updates dependency cycle (EASClient)**: If you hit `Cycle in dependencies between targets 'EASClient' and 'WeatherSunscreen'`, reinstall dependencies so the automated patch runs:
  1. `bun install` (or `npm install`)
  2. `cd ios && pod install`
     The Podfile executes `scripts/patch-expo-updates.sh`, which inlines the client ID and forces `EASClient` to build as a static library. Re-run these steps whenever `expo-updates` is upgraded.

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

Make sure to review the [Repository Guidelines](AGENTS.md) before opening a PR; it covers project layout, workflow commands, and review expectations.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For support, feature requests, or bug reports, please create an issue on the project repository.

---

**Built with ❤️ using React Native, Expo, and modern mobile development practices**
