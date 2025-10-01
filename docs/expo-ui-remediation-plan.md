# Expo UI & Linking Remediation Plan

## Context
- Date observed: 2025-09-28
- Platform: iOS simulator (Expo + Expo Router)
- Key signals: repeated `ExpoUI` native view manager warnings, `Linking` fatal error (resolved), `react-native-reanimated` version mismatch, `weatherService` ↔ `queryClient` require cycle, fallback weather providers triggered due to native module unavailability.

## Goals
- Ensure Expo Router linking works in production with a defined URI scheme.
- Establish a clean Expo UI integration without unsupported view managers.
- Remove require-cycle risk between `weatherService` and `queryClient` to avoid uninitialized states.
- Align Reanimated native/JS versions to prevent runtime instability.
- Document verification steps for QA and CI.

## Iterative Plan

### Phase 1 — Stabilize Linking (Completed)
1. Define canonical scheme `com.weathersunscreen.app` in `app.config.ts`.
2. Mirror scheme in Android intent filters and iOS URL types.
3. Verify with `npx expo config --json` and local launch (no runtime error).

### Phase 2 — Remove Expo UI Usage (Completed)
1. Replaced the iOS Material settings sheet with a fully native React Native implementation that mirrors the Android layout.
2. Removed the `@expo/ui` dependency from the project and lockfile (`bun remove @expo/ui`).
3. Verified that the Metro require-cycle warnings for `ExpoUI` view managers no longer appear.

### Phase 3 — Resolve Require Cycle (Completed)
1. Introduced `src/services/weatherQueryKeys.ts` and `src/services/weatherQueries.ts` to own query-key factories.
2. Simplified `queryClient.ts` to export only the client instance, eliminating the circular `weatherService` import.
3. Updated all consumers/tests to use the new helpers and added Jest coverage in `queryClient.keys.test.ts`.

### Phase 4 — Reanimated Version Alignment (Completed)
1. Pinned `react-native-reanimated` to `4.1.2` via `bun add react-native-reanimated@4.1.2`.
2. Regenerated iOS pods (`cd ios && pod install`) so the native `RNReanimated` pod now resolves to 4.1.2.
3. Confirmed the Metro mismatch warning is cleared.

### Phase 5 — Native Weather Module Coverage (Completed)
1. Linked iOS sources (`WeatherNativeModule.swift`, `WeatherNativeTurboModule.swift`, `RNWeatherNativeModule.m`) into Xcode project and added Android source directory/package registration.
2. Exposed deterministic resolution diagnostics via `WeatherNativeService.__getResolutionDiagnostics()` and expanded unit tests.
3. Ensured logging remains single-shot while capturing payloads for QA validation.

## TODO Checklist
- [x] Add Expo scheme configuration to unblock linking.
- [x] Replace unsupported `expo-ui` components with React Native equivalents.
- [x] Break `weatherService` ↔ `queryClient` require cycle.
- [x] Align Reanimated native + JS versions (both 4.1.2).
- [x] Validate native weather module availability or update fallback strategy.
- [x] Update QA/Test plans once warnings are eliminated.

## Verification Plan
- Automated: `bun run typecheck`
- Automated: `npm test src/services/__tests__/queryClient.keys.test.ts modules/weather-native-module/__tests__/resolution-behavior.test.ts`
- Manual: deep link smoke test on iOS (`com.weathersunscreen.app://forecast/today`).
- Manual: capture Metro/device logs confirming absence of `ExpoUI` view-manager warnings.
