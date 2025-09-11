# SDK 54 Release Checklist

This checklist ensures the app is ready for Expo SDK 54 GA and iOS 26.

## Dependencies & Config

- [ ] Run `npx expo install` to pin SDK 54-compatible versions.
- [ ] Verify `package.json` uses:
  - `expo: ~54.0.0` (stable)
  - `react-native: 0.81.1` with `react: 18.3.1`
  - Expo modules at SDK 54 stable versions
- [ ] Confirm no duplicate lockfiles: only keep `package-lock.json` (ignore/remove `bun.lock`).
- [ ] `app.json` uses `expo-build-properties` with:
  - iOS: `deploymentTarget: "16.0"`, `newArchEnabled: true`, `useFrameworks: "static"` (iOS 26 features runtime-gated)
  - Android: `newArchEnabled: true`, modern SDK versions

## iOS 26 & WeatherKit

- [ ] Xcode 26 image used in EAS (`macos-sequoia-15.5-xcode-26.0`).
- [ ] WeatherKit capability enabled for the bundle ID in Apple Developer portal.
- [ ] Native WeatherKit errors fall back to Open-Meteo/mocks gracefully.
- [ ] iOS 26 home screen is gated and does not render on earlier iOS.

## Liquid Glass (iOS 26+)

- [ ] Native Liquid Glass features are runtime-gated; fallbacks apply on iOS 16–25.
- [ ] Expo Go builds do not require the native module; Dev/EAS builds include it if needed.

## Notifications

- [ ] Permissions gated and handled by `NotificationService`.
- [ ] Scheduling uses `scheduleAt(date)` with Expo triggers.
- [ ] Cancellation paths work and are covered by tests.

## Localization & UX

- [ ] i18n keys exist for Weather screen (loading, error, feelsLike, details).
- [ ] Body part casing normalized and persisted.
- [ ] Optional dev Icon Gallery accessible only in dev.

## Testing & Doctor

- [ ] `npm test` passes locally and in CI.
- [ ] `npx expo-doctor` shows no blocking failures (the prebuild config warning is informational).

## Build

- [ ] iOS: `npm run ios` or `eas build --platform ios --profile development` succeeds.
- [ ] Android: `npm run android` or `eas build --platform android --profile development` succeeds.

## Documentation

- [ ] README updated with SDK 54 notes (WeatherKit capability, Expo Dev Client/EAS requirements).
- [ ] Apple docs updated with Liquid Glass gating and Expo usage.
