# Weather Sunscreen App • Test Plan and TODO

Status: v1 complete (unit/integration tests passing)  
Date: 2025-09-19

## Objectives
- Lock in deterministic, platform-agnostic tests for core features.  
- Validate fallbacks for native gaps (location, notifications, weather module).  
- Guard data flows: i18n, storage, query keys, business rules (sunscreen reapplication).

## Scope
- Services: weather, open-meteo, location, sunscreen, notifications, storage, diagnostics, logger.  
- Context/state: `WeatherProvider` behavior and query orchestration.  
- UI primitives: Card, Input, Button, ModalSheet, Skeleton, StatusBarWrapper, PerfStats.  
- Theming + i18n setup and persistence.  
- Native bridge resolution and shapes (`modules/weather-native-module`).

## Strategy
- Use jest-expo preset for React Native/Expo modules.  
- Mock native APIs in `jest.setup.ts` and per-spec overrides to drive edge cases.  
- Prefer fast unit tests; add light integration for screen flows and routing.

## Additions in this iteration
- New tests:  
  - `src/services/__tests__/storageService.test.ts` — JSON/boolean helpers and error safety.  
  - `src/utils/__tests__/color.test.ts` — alpha-append correctness, clamping, uppercase hex.  
  - `src/services/__tests__/notificationService.test.ts` — permission flow, date trigger fallback, null-safe when module absent.  
  - `src/services/__tests__/queryClient.keys.test.ts` — stable serialization and key shapes.
  - `src/services/__tests__/openMeteoService.hourly.test.ts` — clamps, future-only filtering.  
  - `src/services/__tests__/weatherService.uv-recommendations.test.ts` — UV band → level/SPF mapping.  
  - `src/services/__tests__/weatherService.uv-openmeteo.test.ts` — Open-Meteo UV fallback + hourly guidance validation.

## Current Results
- 51 test suites • 216 tests • 1 snapshot.  
- All green on Node/Jest with `jest-expo` environment.

## TODO (Short Term)
- [done] Add Open-Meteo hourly path boundary tests (48h clamp, future-only window).  
- [done] Add WeatherService UV recommendations table-based tests (all UV bands).  
- Add minimal smoke tests for each screen in `app/(tabs)` ensuring providers mount without native modules.  
- Add AsyncStorage migration test if keys change (`STORAGE_KEYS`).

## Verification Loop (SDK 54)
- Run `bun run verify:sdk54` before merging SDK-related changes (chains install, expo install check, expo doctor, typecheck).
- Run `npm test -- --runInBand` if the verification command reports issues requiring full Jest coverage.
- For native glass/tabs validation: `bun run ios -- --scheme WeatherSunscreenDev` and ensure tab glass fallbacks behave on iOS 26; `bun run android` for API 36 smoke.

## TODO (Medium Term)
- Add contract tests for `WeatherNativeModule` iOS/Android stubs when real implementations land.  
- Add network-resilience tests for Open-Meteo (timeouts, 5xx, malformed payloads).  
- Gate-level performance budgets for Home screen render (threshold via react-native-testing-library).

## Execution
- Run: `npm test` or `npm test -- --watch`.  
- Type-check: `bun run typecheck`.  
- Expo dev: `bun start`.

## Risks & Mitigations
- Native availability variance → default mocks in `jest.setup.ts` and service fallbacks.  
- API changes → narrow, typed mappers in `openMeteoService` + snapshot-free assertions.

## Exit Criteria
- All suites green on CI.  
- No flaky tests over 10 consecutive runs.  
- Coverage emphasizes logic branches over render snapshots.
