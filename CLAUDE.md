# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Weather Sunscreen App - A React Native mobile application built with Expo SDK 54 providing real-time weather, UV index monitoring, and personalized sunscreen recommendations. Uses React Native 0.81.4 with New Architecture (Fabric) enabled and Expo Router v6 for file-based navigation.

**Current Version:** 3.0.0 (Expo SDK 54, iOS 26 support, New Architecture enabled)

## Common Development Commands

### Development Workflow
```bash
# Start Expo development server
bun start                     # or npm start

# Run on platforms (auto-boots simulator/emulator)
bun run ios                   # iOS development build (auto-selects simulator)
bun run android               # Android development build (requires Java 17)
bun run web                   # Web development server

# Explicit device/simulator selection
bun run ios -- --simulator "iPhone 16"
bun run ios -- --device "iPhone de Marcus"
```

### Build & Release
```bash
# Local release builds
bun run ios:release           # iOS release build (requires Xcode 16+, iOS 26 simulator)
bun run android:release       # Android release build (requires Java 17)
bun run android:aab           # Android App Bundle for Play Store

# EAS builds
npx eas build --platform ios --profile development
npx eas build --platform android --profile production
```

### Troubleshooting
```bash
# iOS fixes
bun run fix-pods              # Fix CocoaPods dependency issues
bun run clean-ios             # Clean iOS build artifacts

# Version management
bun run sync-versions         # Sync all versions to CHANGELOG.md
bun run sync-versions:dry     # Preview version changes
```

### Testing
```bash
# Jest test runner
npm test                      # Run all tests
npm test -- --watch           # Watch mode
npm test -- LiquidGlassWrapper  # Run specific suite

# E2E with Maestro
npx maestro test maestro/flows/ios-launch.yaml
npx maestro test maestro/flows/liquid-glass-and-theme.yaml
```

## Architecture & Key Concepts

### Navigation Structure
This project uses **Expo Router v6** (file-based routing) with a nested tab structure:

- **Root Layout**: `app/_layout.tsx` - Handles font loading, splash screen, theme provider
- **Tab Layout**: `app/(tabs)/_layout.tsx` - Switches between NativeTabs (iOS 26+) and legacy Tabs
- **Main Tabs**:
  - `(home)/` - Dashboard, Weather, UV Index, Forecast
  - `(messages)/` - Placeholder for future messaging (scope TBD)
  - `(styles)/` - Settings, personalization, Material 3 toggles
- **Dev Routes**: `(dev)/icon-gallery.tsx`, `(dev)/glass-gallery.tsx`

Routes follow Expo Router conventions: `index.tsx` = default route, `_layout.tsx` = nested layout, `(folder)` = route group (not in URL).

### Theme System
**Single source of truth**: The README mentions `src/theme/theme.tsx` but the `src/` directory doesn't exist yet in this baseline. Current implementation uses:

- `constants/Colors.ts` - Color definitions for light/dark modes
- `components/Themed.tsx` - Themed `Text` and `View` components with `useThemeColor` hook
- `components/useColorScheme.ts` - Re-exports React Native's `useColorScheme`

When `src/theme/` is implemented, it will provide:
- `useTheme()` hook with `{ themeMode, toggleTheme, colors, highContrast, ... }`
- Persisted preference to AsyncStorage (`@WeatherSunscreen:themeMode`)

### Platform Support
- **iOS 16+**: WeatherKit integration (requires bundle ID capability in Apple Developer portal)
- **Android API 29+**: Custom Java implementation with modern APIs
- **Web**: Graceful fallback to browser APIs with mock data

**Important**: Expo Go does not support custom native modules. Use Development Builds (`bun run ios/android`) to test WeatherKit, Liquid Glass, and other native features.

### New Architecture (Fabric)
- **Enabled**: `"newArchEnabled": true` in `app.json`
- Uses TurboModules where appropriate
- Native tabs leverage iOS 26 Liquid Glass and Android Material You
- Performance optimizations with `@shopify/flash-list` in Home/Forecast screens

### Expo SDK 54 Specifics
- **React 19.1.0** + **React Native 0.81.4**
- **Expo Router v6** with typed routes (`experiments.typedRoutes: true`)
- **EAS Update**: Configured with `runtimeVersion: { policy: "appVersion" }`
- Native projects (`ios/`, `android/`) are versioned; keep build settings in native projects, not `app.json`

## Critical Implementation Details

### WeatherKit Fallback Strategy
WeatherKit requires Apple Developer portal capability enablement. If unavailable at runtime:
1. App automatically falls back to service-based weather
2. Safe mock data ensures UX remains intact
3. No user-facing errors or disruptions

### Liquid Glass UI
Uses official `expo-glass-effect` with graceful fallbacks:
- iOS 26+: Native Liquid Glass rendering
- iOS < 26 / Android / Web: Alternative blur/transparency effects
- Force enable for testing on iOS < 26: Set `LIQUID_GLASS_PRE_IOS26=1` or `global.__DEV_LIQUID_GLASS_PRE_IOS26__ = true`

### Build System Notes

#### iOS
- **Xcode 16+** required with iOS 26 simulators recommended
- Auto-select simulator script prevents "Unable to find destination" errors
- CocoaPods patch for expo-updates dependency cycle: `scripts/patch-expo-updates.sh` runs during `pod install`
- Re-run `bun install && cd ios && pod install` after upgrading expo-updates

#### Android
- **Java 17** required (automatically configured in scripts via `JAVA_HOME=/opt/homebrew/opt/openjdk@17/...`)
- Gradle 8.10.2
- Edge-to-edge enabled, predictive back gesture disabled

#### Version Management
- All version numbers sync from `CHANGELOG.md` to `package.json`, `app.json`, native configs
- Run `bun run sync-versions` after updating CHANGELOG.md
- Use `--dry` flag to preview changes before applying

### Path Aliases
TypeScript path alias `@/*` maps to project root:
```typescript
import { Colors } from '@/constants/Colors';
import { Text } from '@/components/Themed';
```

### Performance Optimizations
- Large lists use `@shopify/flash-list` (Home, Forecast)
- Forecast line items memoized with `React.memo`
- Mock data reused via shared modules to minimize re-renders
- Validate metrics with `npx expo start --no-dev --minify` or Release builds

## Project Structure (as-is)
```
weather-suncreen-app/
├── app/                      # Expo Router v6 routes (file-based)
│   ├── _layout.tsx           # Root layout with fonts, splash, theme
│   ├── (tabs)/               # Main tabbed navigation
│   │   ├── _layout.tsx       # Tab layout (NativeTabs/legacy switch)
│   │   ├── index.tsx         # Home tab
│   │   └── two.tsx           # Second tab
│   ├── modal.tsx             # Modal route
│   └── +not-found.tsx        # 404 page
├── components/               # Reusable UI components
│   ├── Themed.tsx            # Themed Text/View wrappers
│   ├── useColorScheme.ts     # Color scheme hook
│   ├── EditScreenInfo.tsx    # Info component
│   ├── ExternalLink.tsx      # External link component
│   └── StyledText.tsx        # Styled text component
├── constants/                # App constants
│   └── Colors.ts             # Light/dark color definitions
├── assets/                   # Images, fonts, icons
├── docs/                     # Technical documentation
│   ├── PROMPT_README.md      # Project instructions
│   ├── EXPO_SDK_54_MIGRATION.md
│   ├── BUILD.md
│   └── liquid-glass.md
├── app.json                  # Expo configuration
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript config with strict mode
```

**Note**: The README references `src/` directory structure (components/ui, context/, services/, theme/, i18n/, types/) which is planned but not yet implemented in this baseline. When adding new features, follow the `src/` structure outlined in the README.

## Development Best Practices

### TypeScript
- Strict mode enabled (`"strict": true` in tsconfig.json)
- Use typed routes from Expo Router v6
- Prefer type inference; add explicit types for public APIs

### Testing
- Write tests for all new utilities and components
- Run relevant test suites after changes (e.g., `npm test -- LiquidGlassWrapper`)
- Use Maestro for E2E device flows (simulator/device required)

### Commits & Versioning
- Follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format
- Update CHANGELOG.md before committing significant changes
- Run `bun run sync-versions` to propagate version updates
- John Carmack reviews all work - maintain high code quality and attention to detail

### Location Services
- iOS: Location usage descriptions required in Info.plist
- Android: Location permissions in AndroidManifest.xml
- Web: Fallback to browser geolocation API
- Test with permissions granted/denied and offline scenarios

### Diagnostics & Feature Flags
- Production diagnostics: Set `PROD_DIAGNOSTICS=1` to buffer warn/error logs
- Liquid Glass testing on iOS < 26: Set `LIQUID_GLASS_PRE_IOS26=1` (JS) or `LIQUID_GLASS_FORCE_ENABLE=1` (native)
- Material 3 experiments: Toggle via Settings screen (dev builds only)

## Common Pitfalls

1. **Expo Updates Dependency Cycle**: If you see "Cycle in dependencies between targets 'EASClient' and 'WeatherSunscreen'", re-run `bun install && cd ios && pod install` to apply the automated patch.

2. **WeatherKit Capability**: Enable WeatherKit in Apple Developer portal for your bundle ID. App gracefully falls back if unavailable, but native features won't work without it.

3. **Custom Native Modules**: Only work in Development/Production builds, not Expo Go. Always use `bun run ios/android` for testing native code.

4. **Java Version**: Android builds require Java 17. The scripts auto-configure `JAVA_HOME`, but ensure OpenJDK 17 is installed (`brew install openjdk@17`).

5. **Simulator Auto-Select**: The iOS script auto-boots a valid simulator. Override with `--simulator` or `--device` flags if needed.

6. **Native Project Settings**: Keep build configurations (bundleIdentifier, entitlements, deployment targets) in native projects (`ios/`, `android/`), not `app.json`, to avoid EAS Build divergence.

## External Documentation

- **Expo SDK 54**: https://docs.expo.dev/versions/v54.0.0/
- **Expo Router v6**: https://docs.expo.dev/router/introduction/
- **React Native New Architecture**: https://reactnative.dev/docs/the-new-architecture/landing-page
- **Performance Best Practices**: https://expo.dev/blog/best-practices-for-reducing-lag-in-expo-apps

## Repository Guidelines

See `AGENTS.md` for project layout, workflow commands, and PR review expectations before contributing.
