# Expo SDK 54 Migration Guide

This guide captures the exact steps and pitfalls when migrating to Expo SDK 54 with React Native 0.81 and iOS 26 "Liquid Glass".

Last updated: 2025-09-16

## Targets & Tooling

- Expo SDK: ~54.0.0 (stable)
- React Native: 0.81.4
- React: 19.1.0
- Node: 18+ (20 recommended)
- Bun: 1.0+ (primary package manager)
- iOS deployment target: 16.0 (production), 26.0 (development features)
- Android: compile/target SDK 36; Kotlin 2.1.21

## Glass Effect (iOS 26+)

- Module: `expo-glass-effect`
- Availability: `GlassView` is only available on iOS 26 and above; it automatically falls back to a regular View on unsupported platforms.
- Known issue: `isInteractive` is only honored on mount — change requires remounting (e.g., change the `key`).
- Docs: Expo GlassEffect (SDK 54).

## New Architecture & Babel

- New Architecture is enabled via `expo.newArchEnabled: true`.
- Reanimated v4 requires the Worklets Babel plugin and it must be the last plugin:

```js
// babel.config.js
module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          'react-compiler': true,
          newArchEnabled: true,
        },
      ],
    ],
    plugins: ['react-native-worklets/plugin'],
  };
};
```

- If you previously used `'react-native-reanimated/plugin'`, change it to `'react-native-worklets/plugin'` per Reanimated 4 migration notes.

## Navigation

- Expo Router: ~6.x (file-based routing under `app/`, entry set to `expo-router/entry`).

## Theme System

- `src/theme/theme.tsx` replaces the legacy `ThemeContext` provider. Hooks (`useTheme`, `useColors`) are synchronous and now persist both `themeMode` and `highContrast` via `storageService`.
- Setter functions (`setThemeMode`, `setHighContrast`, `toggleTheme`) no longer return promises—callers should treat them as fire-and-forget side effects.
- High-contrast state is stored under `@WeatherSunscreen:themeHighContrast`; tests that depend on initial mode should mock AsyncStorage accordingly.

## iOS Configuration Checklist

- `app.json`:
  - `newArchEnabled: true`
  - Note: When using native iOS/Android folders, deployment targets are configured in native code, not app.json
- Scene lifecycle enabled:
  - `UIApplicationSceneManifest` points to `SceneDelegate`
  - `SceneDelegate.swift` present and added to Sources
  - Start React Native exactly once: let `SceneDelegate` create the window and call `startReactNative`. Do not also call it from `AppDelegate` on iOS 13+, or you will hit an assertion in `ExpoAppDelegate.recreateRootView` during startup.
- URL scheme present (e.g., `megasena`)

## Android Configuration

- `expo-build-properties` pins:
  - `compileSdkVersion: 36`, `targetSdkVersion: 36`, `minSdkVersion: 24`
  - `kotlinVersion: 2.1.21`
- If CI images lag, step down Kotlin/SDK one notch and re‑test.
- Edge-to-edge: SDK 54 já habilita comportamento padrão no React Native. Dependência `react-native-edge-to-edge` foi removida; use `androidNavigationBar`/`androidStatusBar` no `app.json` caso precise ajustes específicos.

## Testing & Infra

- Run tests: `npm test` (Jest requires npm, not bun)
- Type check: `bun run typecheck`
- Lint: `bun run lint`
- E2E tests: `npx maestro test maestro/flows/liquid-glass-and-theme.yaml`
- Full validation: Clean install e rodar `npx expo-doctor`
  - 2025-09-16: Com `ios/` e `android/` versionados, `expo-doctor` alerta que propriedades em `app.json` (ex.: `plugins`) não sincronizam automaticamente em builds nativos. Precisamos manter os ajustes equivalentes diretamente em `ios/` e `android/` (documentado abaixo) e revisar o arquivo de configuração a cada upgrade.

## Known Issues / Tips

- Glass effect on storybook: If toggling `isInteractive` appears no‑op, remount the `GlassView` by changing its `key` when args change.
- Performance thresholds: Keep tests resilient to host variance while maintaining meaningful bounds.
- Expo Updates (29.0.10) currently requires `scripts/patch-expo-updates.sh` (invoked automatically from the Podfile) before `pod install` to prevent the `EASClient`/`WeatherSunscreen` build cycle.
- Prebuild divergence: Porque mantemos projetos nativos, os ajustes de `expo-build-properties` em `app.json` servem só como referência. Replique qualquer alteração relevante nos arquivos `ios/WeatherSunscreen.xcodeproj` e `android/build.gradle` quando atualizar SDK.

## References

- Expo GlassEffect (SDK 54): https://docs.expo.dev/versions/latest/sdk/glass-effect/
- Apple iOS 26 newsroom: https://www.apple.com/newsroom/2025/06/apple-elevates-the-iphone-experience-with-ios-26/
- Reanimated 4 migration: https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/
