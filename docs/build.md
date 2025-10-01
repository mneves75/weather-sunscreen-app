## Build Guide

This doc explains how to build, run, and ship the Weather Sunscreen App across iOS, Android, and Web. It follows our repository conventions: use `bun` for local scripts (fallback to `npm`), keep feature code in `src/`, and avoid manual edits in `ios/` and `android/` unless fixing platform issues.

### Prerequisites

- Node.js 20+ and Bun 1.x installed (`curl -fsSL https://bun.sh/install | bash`).
- Expo CLI (auto via `npx expo ...`) and EAS CLI (`npm i -g eas-cli`).
- iOS: Xcode 16.4+ with iOS 26 simulator runtime, CocoaPods (`brew install cocoapods`).
- Android: Java 17, Android Studio SDKs. Set `JAVA_HOME` to JDK 17.

Helpful checks:

```bash
node -v && bun -v
npx expo-doctor
```

### Install

```bash
bun install   # or: npm install
```

### Local Development

```bash
bun start            # Start Expo dev server (dev client)
bun run ios          # Build + run on iOS Simulator (auto-selects best)
bun run android      # Build + run on Android (requires Java 17)
bun run web          # Start web target
```

Notes:
- `bun run ios` uses `scripts/run-ios.mjs` to pick a valid, booted simulator. Override with `--simulator "iPhone 16"`, `--device "My iPhone"`, or `--udid <ID>`.
- Expo Go doesn’t include our native module; use development builds (above) or EAS builds.

### Type Checking and Tests

```bash
bun run typecheck     # TypeScript, strict mode
npm test              # Jest runner (watch: npm test -- --watch)
```

### SDK 54 Verification Gate

Run the dependency + health sweep before pushing SDK 54 changes:

```bash
bun run verify:sdk54
```

This command executes `bun install`, `npx expo install --check`, `npx expo-doctor`, and `bun run typecheck`, failing fast if anything drifts outside the supported matrix.

### Local Release (Smoke Tests)

Useful for quick performance checks without EAS:

```bash
bun run ios:release        # Xcode build (Release) to Simulator
bun run android:release    # Gradle assembleRelease (APK)
bun run android:aab        # Gradle bundleRelease (AAB)
```

Requirements:
- iOS: Xcode 16.4+, iOS 26 simulator image.
- Android: Java 17. If needed: `export JAVA_HOME=$(/usr/libexec/java_home -v 17)` on macOS.

### Cloud Builds (EAS)

Profiles are defined in `eas.json`: `development`, `preview`, `production`.

```bash
# Development (internal distribution + dev client)
npx eas build --platform ios --profile development
npx eas build --platform android --profile development

# Preview (internal distribution: APK on Android, simulator on iOS)
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview

# Production (store-ready)
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
```

Tips:
- Run `eas whoami` and `eas login` as needed.
- Configure credentials and app identifiers on first run.
- OTA updates are managed separately via EAS Update; ensure the project ID and channels are correct before shipping.

### Troubleshooting

Common fixes:

```bash
# iOS health
bun run fix-pods           # Reinstall pods with patches
bun run clean-ios          # Clear Pods/ Podfile.lock/ build/

# Clear Metro bundler caches
npx expo start --clear

# Doctor
npx expo-doctor
```

Known gotchas:
- Expo Updates cycle (EASClient): after dependency bumps, re-run `bun install && (cd ios && pod install)` to trigger the Podfile patch.
- Native projects are versioned. Keep `app.json` as the canonical reference, but replicate necessary changes in `ios/` and `android/` during SDK upgrades (see `docs/EXPO_SDK_54_MIGRATION.md`).
- Android requires Java 17; ensure `JAVA_HOME` points to JDK 17 before Gradle tasks.

### Command Cheat Sheet

- Install: `bun install`
- Dev server: `bun start`
- Run iOS/Android/Web: `bun run ios | android | web`
- Typecheck: `bun run typecheck`
- Tests: `npm test` (watch: `npm test -- --watch`)
- SDK 54 verification gate: `bun run verify:sdk54`
- EAS build: `npx eas build --platform ios|android --profile development|preview|production`

