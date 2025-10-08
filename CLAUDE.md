# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Weather Sunscreen App - A React Native mobile application built with Expo SDK 54 providing real-time weather, UV index monitoring, and personalized sunscreen recommendations. Uses React Native 0.81.4 with New Architecture (Fabric) enabled and Expo Router v6 for file-based navigation.

**Current Version:** 3.1.0 (Expo SDK 54, iOS 26 support, New Architecture enabled, Jest testing infrastructure)

## Reference Documentation - CRITICAL

**ALWAYS consult the reference documentation in `docs/REF_DOC/` before implementing features or answering questions** about the following technologies. This documentation represents the most recent, authoritative source for:

### iOS 26 / iPadOS 26 / macOS 26 Features
**Location:** `docs/REF_DOC/docs_apple/`

- **Liquid Glass UI**: `liquid-glass.md`, `adopting-liquid-glass.md` - Complete implementation guide for glass effects, containers, performance optimization
- **SwiftUI**: `apple_documentation_swiftui/` - Latest SwiftUI APIs, view modifiers, and patterns
- **Human Interface Guidelines**: `apple_design_human-interface-guidelines/` - Platform-specific design patterns, components, and best practices
- **Swift 6 & Concurrency**: `swift-concurrency.md`, `modern-swift.md` - Strict concurrency, actor isolation, Sendable conformance
- **Additional Resources**: `SWIFT-IOS-ADDITIONAL-DOCS.md`, `swift-testing-playbook.md`

**When to consult:**
- Implementing glass effects or Material Design 3 components
- Working with native iOS/macOS features (widgets, extensions, toolbars)
- Bridging React Native to Swift/Objective-C
- Troubleshooting platform-specific UI issues
- Ensuring accessibility compliance

### AI SDK (Vercel AI SDK)
**Location:** `docs/REF_DOC/docs_ai-sdk_dev/`

- **Core Documentation**: `docs/` - Complete AI SDK API reference, streaming, tools, agents
- **Cookbook**: `cookbook/` - Real-world examples and integration patterns
- **Model Support**: `gpt-5.md` - Latest GPT-5 capabilities, parameters, best practices
- **Gemini Integration**: Check `cookbook/guides/` for Gemini-specific examples

**When to consult:**
- Implementing AI-powered features (recommendations, chatbots, insights)
- Integrating with Anthropic Claude, OpenAI GPT-5, Google Gemini
- Working with streaming responses, tool calling, or structured data generation
- Building conversational interfaces or agent workflows
- Optimizing AI performance and costs

### Expo SDK 54
**Location:** `docs/REF_DOC/docs_expo_dev/`

- **Core Concepts**: `core-concepts.md` - Expo fundamentals, module architecture
- **Build System**: `build/`, `eas/` - EAS Build, local builds, native project management
- **Deployment**: `deploy/`, `distribution/` - App store submission, OTA updates
- **Development**: `develop/` - Development builds, debugging, testing
- **EAS Services**: `eas-update/`, `eas-insights/` - Updates, monitoring, analytics

**When to consult:**
- Configuring app.json, eas.json, or native projects
- Troubleshooting build failures or module resolution
- Implementing OTA updates or EAS Update strategies
- Setting up CI/CD with EAS Build
- Managing development vs production builds

### React Native
**Location:** `docs/REF_DOC/docs_reactnative_getting-started/`

- **Getting Started**: Comprehensive React Native setup and architecture guides
- **New Architecture**: Fabric renderer, TurboModules, JSI
- **Platform Integration**: Native modules, bridging, iOS/Android specifics
- **Performance**: Optimization techniques, profiling, debugging

**When to consult:**
- Working with native modules or creating custom bridges
- Implementing platform-specific code (iOS/Android)
- Debugging performance issues or memory leaks
- Understanding React Native internals (Metro, Hermes, JSC)
- Migrating to New Architecture or troubleshooting compatibility

### Documentation Best Practices

1. **Check Before Implementing**: Always search relevant docs before writing code for these technologies
2. **Verify Current APIs**: SDK 54 and iOS 26 introduced breaking changes - confirm API availability
3. **Follow Official Patterns**: Use documented patterns rather than improvising solutions
4. **Platform Parity**: When implementing cross-platform features, consult both iOS and Android sections
5. **Security & Privacy**: Check Apple docs for privacy manifests, entitlements, and capability requirements
6. **Performance**: Reference official performance guides before optimizing

### Quick Reference Commands
```bash
# Search documentation
grep -r "keyword" docs/REF_DOC/docs_apple/
grep -r "keyword" docs/REF_DOC/docs_ai-sdk_dev/
grep -r "keyword" docs/REF_DOC/docs_expo_dev/

# Count available references
find docs/REF_DOC -name "*.md" -type f | wc -l  # 1096+ docs available
```

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
npm test                      # Run all tests (or bun test)
npm test -- --watch           # Watch mode (or bun test:watch)
npm test -- --coverage        # Coverage report (or bun test:coverage)
npm test -- LiquidGlassWrapper  # Run specific suite
npm test -- WeatherService    # Run specific service tests

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
**Single source of truth**: `src/theme/theme.tsx` with `useTheme()` hook providing:
- `{ themeMode, toggleTheme, colors, highContrast, ... }`
- Persisted preference to AsyncStorage (`@WeatherSunscreen:themeMode`)
- Token-based design system in `src/theme/tokens.ts`
- Support for light/dark/high-contrast modes
- DynamicColorIOS for glass effects on iOS 26+

Color definitions also available in legacy `constants/Colors.ts` for backward compatibility.

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

## Project Structure
```
weather-suncreen-app/
├── app/                      # Expo Router v6 routes (file-based)
│   ├── _layout.tsx           # Root layout with fonts, splash, theme
│   ├── (tabs)/               # Main tabbed navigation
│   │   ├── _layout.tsx       # Tab layout (NativeTabs/legacy switch)
│   │   ├── (home)/           # Home tab stack
│   │   ├── (messages)/       # Messages tab stack
│   │   └── (styles)/         # Styles/Settings tab stack
│   ├── (dev)/                # Development screens
│   ├── modal.tsx             # Modal route
│   └── +not-found.tsx        # 404 page
├── src/                      # Source code organized by feature
│   ├── components/           # Reusable UI components
│   │   ├── ui/               # Basic UI components
│   │   ├── glass/            # Glass morphism components
│   │   └── icons/            # Icon components
│   ├── context/              # React Context providers
│   │   ├── WeatherContext.tsx
│   │   ├── MessagesContext.tsx
│   │   └── ThemeContext.tsx
│   ├── services/             # Business logic and API services
│   │   ├── WeatherService.ts
│   │   ├── MessageService.ts
│   │   ├── AIService.ts
│   │   └── AlertRuleEngine.ts
│   ├── types/                # TypeScript type definitions
│   ├── theme/                # Theme system and tokens
│   │   ├── theme.tsx         # Theme context and hooks
│   │   ├── tokens.ts         # Design tokens
│   │   └── AppProviders.tsx  # App-wide providers
│   ├── i18n/                 # Internationalization (i18next)
│   └── utils/                # Utility functions
├── assets/                   # Images, fonts, icons
├── docs/                     # Technical documentation
│   ├── docs_ai-sdk_dev/      # Vercel AI SDK documentation
│   ├── docs_apple/           # Apple/iOS/Swift documentation
│   └── docs_expo_dev/        # Expo SDK documentation
├── .cursor/rules/            # Cursor AI rules (20 total)
├── app.json                  # Expo configuration
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript config with strict mode
```

## Development Best Practices

### Service Layer Pattern
Services use simple module exports (ES module system provides singleton behavior):
```typescript
class WeatherService {
  private constructor() {
    // Initialize
  }

  public async getWeatherData(): Promise<WeatherData> {
    // Implementation with error handling
  }
}

// Export instance - module system ensures singleton
export const weatherService = new WeatherService();
```

**Note**: This project previously used Java-style `getInstance()` patterns but simplified to direct exports in v3.1.0.

### Context Pattern
State management via React Context:
```typescript
// Use context for global state
const { weather, isLoading, error } = useWeather();
const { messages, unreadCount } = useMessages();
const { colors, themeMode, toggleTheme } = useTheme();
```

### TypeScript
- Strict mode enabled (`"strict": true` in tsconfig.json)
- Use typed routes from Expo Router v6
- Prefer type inference; add explicit types for public APIs

### Testing
- Jest + React Native Testing Library configured for Expo SDK 54
- Custom mocks available for AsyncStorage, expo-router, expo-location, expo-secure-store
- Run `npm test -- --watch` during development for instant feedback
- Coverage reports with `npm test -- --coverage`
- Use Maestro for E2E device flows (simulator/device required)
- All service tests include cache immutability, API fallback, and error handling validation

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

## SDK 54 Key Features

### Precompiled React Native for iOS
- **Build Speed:** 120s → 10s (12x improvement) on React Native core
- XCFrameworks shipped alongside source
- Not compatible with `use_frameworks!` in Podfile
- Automatically used in SDK 54 unless `use_frameworks!` is set

### iOS 26 & Liquid Glass
- **expo-glass-effect**: `<GlassView>`, `<GlassContainer>` components with native UIVisualEffectView
- **Icon Composer Support**: `.icon` format for Liquid Glass app icons (macOS only tooling)
- **NativeTabs Enhancements**:
  - Badge support for notifications
  - Tab bar minimize behavior (`minimizeBehavior="onScrollDown"`)
  - Separate search tab (`role="search"`)
  - Tab bar search input with `headerSearchBarOptions`
  - DynamicColorIOS for adaptive colors in glass contexts
- Check availability: `isLiquidGlassAvailable()` before rendering glass components
- Accessibility: `AccessibilityInfo.isReduceTransparencyEnabled()` for fallback to solid backgrounds
- **Performance Guidance**: Limit to 5-10 glass effects on static screens, disable during heavy animations/scrolling
- **Interactive Glass**: `isInteractive` prop set-once on mount (remount with different key to toggle)

### React Native 0.81 & React 19.1
- **React 19.1** with improved hooks (`use` hook, enhanced refs)
- **React Compiler** enabled by default (auto-memoization)
- Owner stacks for better error messages
- Unhandled promise rejections now logged as errors
- First-party JSC support removed (use community JSC if needed)

### New & Stable APIs
- **expo-file-system**: Stable object-oriented API (was `/next`)
  - `File` and `Directory` classes
  - Legacy API at `expo-file-system/legacy` (deprecated in SDK 55)
- **expo-sqlite**: localStorage API for web compatibility
  - SQLite extensions support (`loadExtensionAsync`)
  - sqlite-vec bundled for vector data
- **expo-app-integrity**: DeviceCheck (iOS) & Play Integrity API (Android)
- **expo/blob**: Binary data handling (beta)
- **expo-updates**:
  - `setUpdateRequestHeadersOverride()` for runtime header overrides
  - `downloadProgress` in `useUpdates()` hook
  - `reloadScreenOptions` for custom reload screens

### Performance & Developer Experience
- **buildCacheProvider**: Skip rebuilds with same fingerprint
  - EAS provider: `"buildCacheProvider": "eas"` in app.json
  - Downloads cached builds instead of recompiling
- **Improved Autolinking**:
  - Transitive dependencies now autolinked (React Native modules)
  - Unified behavior across Expo/React Native modules
  - Better monorepo support
- **Import Stack Traces**: Enabled by default, shows import chains on errors
- **experimentalImportSupport**: Default on (better ESM, tree shaking, React Compiler)
- **CSS Autoprefixing**: Rust-based `lightningcss` by default

### Android Updates
- **Target API 36** (Android 16)
- **Edge-to-edge**: Always enabled, cannot be disabled - use `react-native-safe-area-context`
- **Predictive back gesture**: Opt-in via `android.predictiveBackGestureEnabled`
- `androidNavigationBar.enforceContrast` for navigation bar contrast
- **Material Design 3**: Use Material You color system for Android parity with iOS Liquid Glass
- **Native Tabs**: Max 5 tabs on Android, drawable-only icons (no SF Symbols)

### Expo CLI Enhancements
- React Compiler enabled by default
- Import stack traces enabled
- `experimentalImportSupport` default on
- Unhandled promise rejections logged as errors
- TypeScript 5.9.2 recommended
- Autolinking module resolution experiment (`experiments.autolinkingModuleResolution`)

### Deprecations & Breaking Changes
- **expo-av** removed in SDK 55 (migrate to expo-audio/expo-video)
- **SafeAreaView** deprecated (use react-native-safe-area-context)
- **notification config** deprecated (use expo-notifications plugin)
- **expo-file-system**: Legacy API at `/legacy`, removed in SDK 55
- **Reanimated v4**: Requires New Architecture, introduces react-native-worklets
- **Metro internals**: `metro/src/..` → `metro/private/..`
- **locales config**: Now supports both iOS and Android

### Tool Requirements
- **Xcode**: Minimum 16.1, recommended 26 (for iOS 26 features)
- **Node**: Minimum 20.19.4
- **Java**: 17 for Android builds

## UI/UX Modernization Best Practices

### Liquid Glass Design Patterns
- **Glass Cards**: Use `GlassView` for cards, modals, headers (iOS 26+)
- **Containers**: Wrap multiple glass elements in `GlassContainer` with `spacing` prop for merging
- **Fallbacks**: Provide `BlurView` or solid backgrounds for iOS < 26 and reduced transparency mode
- **Tinting**: Apply subtle `tintColor` to match theme, avoid heavy tints that obscure content
- **Performance**: Disable glass during scrolling/animations, limit to 5-10 effects per screen

### Material Design 3 (Android)
- **Color System**: Use theme-based Material You colors for Android parity
- **Components**: Elevated cards, filled buttons, outlined text fields
- **Motion**: Emphasize delight with container transforms and shared element transitions
- **Accessibility**: Ensure 4.5:1 contrast ratios, large touch targets (48dp minimum)

### React Native Performance
- **StyleSheet.create**: Always use for style definitions, never inline objects in render
- **Console.log Removal**: Strip all `console.log` statements in production builds
- **FlashList**: Use `@shopify/flash-list` for lists with 10+ items
- **Memoization**: Let React Compiler handle, remove manual `useMemo`/`useCallback` unless profiled
- **Release Build Testing**: Always test performance in release mode with `--no-dev --minify`

### Component Style Patterns
```typescript
// ✅ Good: StyleSheet with theme integration
export function Card({ children, style }: CardProps) {
  const { colors } = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
});

// ❌ Bad: Inline objects
<View style={{ borderRadius: 16, padding: 20 }}> // Creates new object every render
```

### Accessibility Requirements
- **Labels**: All interactive elements need `accessibilityLabel`
- **Roles**: Use `accessibilityRole` ("button", "link", "header", etc.)
- **States**: Apply `accessibilityState` for disabled, selected, checked
- **Screen Readers**: Test with VoiceOver (iOS) and TalkBack (Android)
- **Contrast**: Minimum 4.5:1 for text, 3:1 for large text/UI components

## AI Integration

This project integrates with the **Vercel AI SDK** for intelligent features:
- AI-powered sunscreen recommendations
- Smart notification content generation
- Weather insights chatbot
- Activity suggestions based on conditions

**Setup:**
```bash
npx expo install ai @ai-sdk/anthropic
```

See `docs/REF_DOC/docs_ai-sdk_dev/` for comprehensive AI SDK documentation including GPT-5 and Gemini integration guides.

## Documentation Priority

**ALWAYS prioritize local documentation** in `docs/REF_DOC/` over external links. The local docs are comprehensive, version-specific (SDK 54, iOS 26), and guaranteed to be authoritative.

### Local Documentation (Primary Source)
- **Apple/iOS 26/macOS 26**: `docs/REF_DOC/docs_apple/` - 1096+ markdown files
- **AI SDK (Vercel)**: `docs/REF_DOC/docs_ai-sdk_dev/` - Complete API reference + GPT-5/Gemini guides
- **Expo SDK 54**: `docs/REF_DOC/docs_expo_dev/` - Build, deploy, EAS services
- **React Native**: `docs/REF_DOC/docs_reactnative_getting-started/` - New Architecture, performance

### External Documentation (Secondary Reference)
Use these only when local docs don't cover a specific topic:
- **Expo SDK 54**: https://docs.expo.dev/versions/v54.0.0/
- **Expo Router v6**: https://docs.expo.dev/router/introduction/
- **Expo Router Native Tabs**: https://docs.expo.dev/router/advanced/native-tabs/
- **expo-glass-effect**: https://docs.expo.dev/versions/v54.0.0/sdk/glass-effect/
- **React Native New Architecture**: https://reactnative.dev/docs/the-new-architecture/landing-page
- **Performance Best Practices**: https://expo.dev/blog/best-practices-for-reducing-lag-in-expo-apps
- **Precompiled React Native**: https://expo.dev/blog/precompiled-react-native-for-ios
- **Material Design 3**: https://m3.material.io/
- **Vercel AI SDK**: https://sdk.vercel.ai/docs

## Repository Guidelines

See `AGENTS.md` for project layout, workflow commands, and PR review expectations before contributing.

## Important Notes

### Documentation Structure (Updated 2025-10-04)
Reference documentation is consolidated in `docs/REF_DOC/` with 1096+ markdown files:
- **Apple/iOS 26**: `docs/REF_DOC/docs_apple/` - Swift, SwiftUI, Liquid Glass, HIG
- **AI SDK**: `docs/REF_DOC/docs_ai-sdk_dev/` - Vercel AI SDK, GPT-5, Gemini
- **Expo SDK 54**: `docs/REF_DOC/docs_expo_dev/` - Complete Expo guides and API references
- **React Native**: `docs/REF_DOC/docs_reactnative_getting-started/` - New Architecture, platform integration

**CRITICAL**: Always consult `docs/REF_DOC/` BEFORE implementing features or answering questions about these technologies. See "Reference Documentation - CRITICAL" section above for detailed usage guidelines.

### Jest Version Constraint
Jest is pinned to `~29.7.0` (not `^30.x`) for compatibility with `jest-expo@54.0.12`. Do not upgrade Jest independently.
