# Expo SDK 54 • Ultrathink Hardening Checklist (2025-09-29)

_Reviewer:_ internal ultrathink sweep (target: John Carmack-ready)

## Objectives
- Remove lingering accuracy gaps in weather/UV metrics so the UI reflects real Open-Meteo data without hard-coded placeholders.
- Ensure forecast and summary cards present localized, truthful values (including humidity/visibility fallbacks) while staying a11y-friendly.
- Align configuration/docs/runbooks with the new dependency verification workflow so future upgrades stay inside the SDK 54 guardrails.
- Capture outstanding risks + diagnostics hooks to keep glass/native tabs instrumentation observable.

## High-Priority TODOs
1. **Weather service accuracy + visibility fallbacks**  
   - Strip the hard-coded `visibility: 10` placeholder, allow nullable visibility when upstream data is missing, and make the UI localize unavailable stats.  
   - Update `WeatherData` types, summary components, and i18n strings accordingly; refresh targeted tests.  
   - ✅ Completed 2025-09-29 (`WeatherService`, `WeatherSummaryCard`, translation + fallback tests updated).

2. **Forecast & UV presentation polish**  
   - Surface real humidity/precipitation confidence in forecast previews without stale values, and ensure UV copy/labels respect locale and loading states.  
   - Add regression coverage confirming the reformatted rows behave when data is missing.  
   - ✅ Completed 2025-09-29 (`ForecastPreview` humidity text + new test covering fallback).

3. **Config + runbook alignment**  
   - Point `app.config.ts` extras at our actual Open-Meteo endpoints (remove unused OpenWeather/OpenUV URLs) and document the verification loop (including `bun run verify:sdk54`) inside `docs/EXPO_SDK_54_MIGRATION.md` and `docs/test-plan.md`.  
   - ✅ Completed 2025-09-29 (config cleaned, migration + test plan include verification loop).

4. **Diagnostics + known-issue traceability**  
   - Summarize current glass/native tabs caveats in the migration doc’s “Known Issues” section and ensure the diagnostics sink guidance (and tests) reflects the new hook wiring.  
   - ✅ Completed 2025-09-29 (migration doc updated with Expo Go glass caveat + diagnostics hook note; `useNativeTabsToggle` test covers logging).

_Status: 2025-09-29 wave completed. New observations below for the next pass._

## Next Wave TODO (Ultrathink Pass 02)
1. **Tame Expo test warnings + logger noise**  
   - Set `process.env.EXPO_OS = 'ios'` inside the Jest env bootstrap and centralize a `muteLogger` helper so unit tests don’t flood output with Expo warnings/logs.  
   - ✅ Completed 2025-09-29 (`jest.env.js`, `jest.setup.ts`, `src/tests/loggerTestUtils.ts` + dedicated spec).

2. **WeatherSummaryCard fallback coverage**  
   - Add a dedicated spec for `WeatherSummaryCard` verifying humidity/visibility fallbacks render the localized “—” copy (and hide rows when values are absent).  
   - ✅ Completed 2025-09-29 (`WeatherSummaryCard.test.tsx`).

3. **Offline UV/forecast test tightening**  
   - Update `weatherService.offline-fallback.test.ts` to stub `OpenMeteoService.getHourlyForecast` explicitly (matching the production signature).  
   - Assert the fallback payload behaves consistently (UV fallback = 7).  
   - ✅ Completed 2025-09-29 (test now mocks hourly API + checks fallback UV).
