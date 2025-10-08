# Automated Store Screenshots

This guide explains how to generate App Store and Google Play screenshots using the Fastlane tooling that now lives in this repository.

## Prerequisites

- macOS with Xcode 16+ (includes the required iOS simulators)
- Android SDK / Android Studio with at least one emulator image installed
- Ruby 3.x with Bundler (`gem install bundler` if needed)
- Expo development build prerequisites (Node 20+, Watchman, etc.)

> **Apple credentials**: If you intend to upload screenshots with Fastlane deliver, export `APP_STORE_CONNECT_USERNAME` and `APP_STORE_CONNECT_TEAM_ID`. They are optional for local capture.

## Initial Setup

From the repository root:

```bash
bundle install
```

This installs Fastlane and the plugins declared in `Gemfile`. The Fastlane configuration lives in `fastlane/`:

- `Fastfile` – lanes for iOS, Android, and combined runs
- `Snapfile` – devices, locales, and scheme for iOS screenshots
- `Screengrabfile` – locales and settings for Android screenshots
- `Appfile` – shared app metadata (bundle ID, team ID)

## Generating Screenshots

### iOS (snapshot)

```bash
bundle exec fastlane ios screenshots
```

Fastlane will boot each device listed in `Snapfile`, run the `WeatherSunscreenAppUITests` UI test target, and place results under `fastlane/screenshots/ios/<locale>/`.

### Android (screengrab)

1. Start the target emulator (for example via Android Studio or `emulator -avd <name>`).
2. Run:

   ```bash
   bundle exec fastlane android screenshots
   ```

The `ScreenshotTest` instrumentation suite will execute and images will be written to `fastlane/screenshots/android/<locale>/`.

### Both platforms

```bash
bundle exec fastlane store_screenshots
```

Fastlane sequentially runs the iOS and Android lanes, producing a complete screenshot set in the `fastlane/screenshots` directory.

## Customisation Tips

- **Locales / devices**: edit `Snapfile` and `Screengrabfile` to add or remove languages and hardware targets.
- **Test flows**: update `ios/weathersuncreenappUITests/WeatherSunscreenAppUITests.swift` and `android/app/src/androidTest/.../ScreenshotTest.kt` to drive additional screens.
- **Clean runs**: pass `erase_simulator: true` to `snapshot` or add `clearPackageData` arguments in `Screengrabfile` if you need a fully fresh environment.

## Troubleshooting

- If `snapshot` errors about missing simulators, run `xcrun simctl list devices` and ensure the names in `Snapfile` match installed runtime images.
- For Watchman recrawl warnings during tests, clear the watch: `watchman watch-del . && watchman watch-project .`.
- Android instrumentation requires an unlocked emulator. If tests hang, bring the emulator to the foreground and ensure it is booted before running Fastlane.

With these steps you can reproduce a full set of localized, device-specific screenshots suitable for submission to both stores.
