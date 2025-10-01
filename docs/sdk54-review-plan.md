# Expo SDK 54 Hardening Plan (2025-09-28)

## Context & Fresh Findings (2025-09-28)
- Dependency drift risk: `package.json` still uses carets for Expo-managed packages (for example `react-native-web@^0.21.0`). A single upstream patch could move us out of the SDK 54 compatibility window; the Expo team explicitly couples SDK 54 to the `~0.21.x` line and recommends running `expo install --check` on every upgrade.citeturn0search2
- Platform parity gaps: `MaterialSettingsContent.web.tsx` lacks the Native Tabs toggle, Liquid Glass copy, and reset affordances that iOS/Android expose, so web previews can’t stage or test the feature flags.
- Diagnostics dead-end: `attachDiagnosticsSink()` is never called during bootstrap (`AppProviders`), which means recent `logger.userAction` and fallback metrics are silently dropped even when `productionDiagnosticsEnabled` is flipped via flags.
- Liquid Glass guardrails: our wrappers don’t yet follow the latest `expo-glass-effect` guidance—specifically, reporting availability, surfacing tint presets, and accounting for the `isInteractive` remount limitation.citeturn0search5
- Known ecosystem issues: current GitHub issues show Liquid Glass inconsistencies between Expo Go and device builds, underscoring the need to validate native builds once we tweak glass wrappers.citeturn0search1

## Research Anchors
- Expo SDK 54 changelog & dependency matrixciteturn0search2
- Expo Router v6 native tabs documentation (experimental guidance, limitations)citeturn0search0
- Expo Glass Effect reference (API, availability constraints)citeturn0search5
- SDK 54 Liquid Glass launch articles and best practicesciteturn0search4turn0search3

## Hardening Roadmap (Ultrathink TODOs)
1. **Lock the SDK 54 dependency matrix (high risk).**
   - Pin Expo-managed packages (`react`, `react-dom`, `react-native-web`, `@expo/*`) to tilde ranges matching the published matrix, then run `bun install`, `npx expo install --check`, and document any overrides (including `expo-doctor` output) in `docs/EXPO_SDK_54_MIGRATION.md` and the snapshot table below.citeturn0search2
   - Diff `bun.lock` to ensure no stray React 19 prereleases sneak in; if overrides are required, codify them via `resolutions` plus a note in `docs/build.md`.
   - Status (2025-09-28): Completed. Expo-managed deps pinned (`react-native-web@~0.21.0`, `@expo/vector-icons@~15.0.2`, `expo-secure-store@~15.0.7`), `bun install` + `npx expo install --check` report clean output, and `npx expo-doctor` surfaces only the known scheme sync warning documented in `docs/EXPO_SDK_54_MIGRATION.md`. New guard command: `bun run verify:sdk54`.

2. **Automate the compatibility gate.**
   - Author `scripts/verify-sdk54.mjs` to chain `bun install`, `expo install --check`, `expo-doctor`, `bun run typecheck`, and (optionally) dry-run `npm test` with `--runInBand` for CI stability.
   - Add a `verify:sdk54` npm script and weave it into pre-push Git hooks / CI workflows (referenced in `README.md` and `docs/build.md`).
   - Status (2025-09-28): Completed via `scripts/verify-sdk54.mjs` and the new `verify:sdk54` script documented in `docs/build.md` / `docs/EXPO_SDK_54_MIGRATION.md`.

3. **Unify Material settings across platforms.**
   - Introduce a shared `MaterialSettingsSection` abstraction consumed by `.android.tsx`, `.ios.tsx`, and `.web.tsx`; ensure the web variant mirrors Native Tabs + Liquid Glass toggles, reset controls, and translations.
   - Backfill a web renderer test (`src/components/settings/__tests__/MaterialSettingsContent.web.test.tsx`) to assert the toggles are present and correctly labelled in both locales.
   - Status (2025-09-28): Completed. Shared section model now drives all platform targets (`materialSettingsSections.ts`), the web UI mirrors Native Tabs/Material toggles, and a Jest DOM test exercises the web renderer.

4. **Centralize Native Tabs toggle instrumentation.**
   - Provide a `useNativeTabsToggle()` hook that encapsulates analytics (`logger.userAction`), persistence (`useAppStore`), and diagnostics forwarding.
   - Expand `useTabSwitchMetrics` (in `app/(tabs)/_layout.tsx`) to emit duration histograms to the diagnostics sink, and add `src/__tests__/router-native-tabs.test.tsx` validating events on route changes. Reference native tabs docs for edge behaviour (e.g., `disableTransparentOnScrollEdge`).citeturn0search0
   - Status (2025-09-28): Completed. `useNativeTabsToggle` now centralizes logging + persistence, routing metrics emit structured payloads (info + userAction), and the settings/Native Tabs tests assert the instrumentation payload (`source: 'settings'`).

5. **Upgrade Liquid Glass wrappers to the latest guidance.**
   - Update `LiquidGlassWrapper` / `GlassTabBarBackground` to surface `isLiquidGlassAvailable()` states, fallback reasons, and dynamic tint presets; respect the `isInteractive` remount constraint documented by Expo.citeturn0search5
   - Provide a11y copy or subtle badges when fallbacks engage, and ensure diagnostics logging matches the new sink wiring.
   - Add regression tests under `src/components/glass/__tests__/` covering availability permutations.
   - Status (2025-09-28): Completed. Wrappers now emit fallback telemetry, expose accessibility labels/test IDs, respect interactive variants, and refreshed Jest suites (`LiquidGlassWrapper.test.tsx`, `useGlassTabBarBackground.test.ts`) cover reduce-motion, platform, and diagnostics scenarios.

6. **Attach diagnostics sinks and expose buffers.**
   - Call `attachDiagnosticsSink()` within `AppProviders` when either `__DEV__` or `featureFlags.productionDiagnosticsEnabled` is true; export a developer toggle to inspect buffered logs.
   - Add Jest coverage verifying events land when the flag is toggled, and document the workflow in `docs/test-plan.md`.
   - Status (2025-09-28): Completed. `AppProviders` now attaches the diagnostics sink on boot, `useNativeTabsToggle` emits diagnostic infos when enabled, and `useNativeTabsToggle.test.ts` asserts the logging path.


7. **Finish UV + weather data plumbing.**
   - Align `app.config.ts` API URLs with Open-Meteo (or remove unused OpenWeather/OpenUV keys) to avoid configuration drift.
   - Adjust `WeatherService.getUVIndexDataForLocation` to choose the nearest-hour reading (not just index 0), guard empty arrays, and format timestamps via a memoized helper respecting locale.
   - Extend `WeatherService` integration specs to cover daylight edge cases and missing hourly data.

8. **Accurize current conditions + forecast metrics.**
   - Remove hard-coded visibility/pressure fallbacks; if Open-Meteo lacks the metric, return `null` and update UI components to hide the row or display localized “unavailable” copy.
   - Enrich `ForecastPreview` accessibility hints with translated humidity/precipitation confidence values.

9. **Codify Liquid Glass & Native Tabs validation loops.**
   - Script a deterministic runbook capturing: `bun run typecheck`, `npm test`, `npx expo-doctor`, `bun run ios -- --scheme WeatherSunscreenDev`, and `bun run web` to manually verify glass fallbacks per the Expo issue tracker.citeturn0search1
   - Document the runbook (with exact commands and acceptance criteria) in `docs/test-plan.md` and link it from `docs/EXPO_SDK_54_MIGRATION.md`.

10. **Localization & theming QA sweep.**
   - Audit new strings (diagnostics banners, glass fallbacks) in both `en.json` and `pt-BR.json`; ensure no inline literals remain in TSX.
   - Extend `src/__tests__/localization-smoke.test.ts` to flip languages and high-contrast mode through the Material settings flow, asserting that toggles stay reachable and glass fallback badges localize correctly.

11. **Communicate open risks & follow-ups.**
   - Track upstream SDK 54 issues (like the Expo Go vs. device Liquid Glass discrepancy) in `docs/EXPO_SDK_54_MIGRATION.md` under “Known Issues” with reproduction steps and mitigation plans.citeturn0search1
   - Propose contingency flags (e.g., `featureFlags.enableLiquidGlassPreIOS26`) documentation so support can disable features quickly if new regressions surface.

## Next Validation Snapshot (to fill after execution)
- Date & operator
- `npx expo install --check` output summary
- `npx expo-doctor` status (17/17 checks?)
- Native build smoke results (iOS 26 simulator + Android API 36)
- Outstanding risks / bugs linked from issue tracker
