# Fresh Eyes Re-Audit — October 1, 2025

## Snapshot
- **Scope**: Weather + UV home flows, shared hooks/services, localization pipeline, recent audit docs
- **Primary Risks**: Duplicate first-load network calls, unit preferences ignored in UI, mixed localization strategy, stale documentation

## High-Impact Findings

1. **Duplicate Data Fetches on First Location Fix** (High)  
   `WeatherProvider` already schedules a `refreshAll` after every coordinate change (`src/context/WeatherContext.tsx:161`), but each consumer hook (`src/hooks/useWeatherData.ts:46`, `src/hooks/useForecast.ts:36`, `src/hooks/useUVIndex.ts:57`) also fires its own `refresh*` call when the same change renders. On a cold start this produces back-to-back requests for weather, forecast, and UV. Besides wasted requests, it risks race conditions when upstream rate limits tighten.

2. **Unit Preferences Ignored in Hero & Forecast Surfaces** (High)  
   Despite exposing converters in `useWeatherData`, components render raw metric values: 
   - `WeatherCard` prints Celsius/metric literals (`src/components/weather/WeatherCard.tsx:31-46`).
   - `WeatherDetails` echoes km/h and hPa straight from the API (`src/components/weather/WeatherDetails.tsx:37-69`).
   - `ForecastDayCard` shows °C highs/lows regardless of preference (`src/components/weather/ForecastDayCard.tsx:41-58`).
   As a result, Fahrenheit / mph selections in Settings have no visible effect—functionally broken for U.S. users.

3. **Core Strings Bypass i18n** (Medium)  
   Key surfaces hand-roll locale checks or hard-code English: Weather card labels, UV indicator copy, skin-type selector, and large swaths of the Settings screen rely on ternaries like `locale === 'pt-BR' ? ... : ...`. This fragments translation management and risks future language additions. Examples include `WeatherDetails` title/labels (`src/components/weather/WeatherDetails.tsx:50-68`) and the UV indicator header (`src/components/weather/UVIndicator.tsx:26-48`).

4. **Locale-Agnostic Time Formatting** (Medium)  
   `formatTime` pins `toLocaleTimeString` to `en-US` (`src/utils/date.ts:11-27`), so even Portuguese users with 24h preferences see "Updated 2:30 PM". The helper should honour both the active locale and a potential 24-hour flag from user settings.

5. **Stale Audit Documentation** (Medium)  
   `docs/FRESH_EYES_AUDIT_2025.md` still reports 23 TypeScript errors and incomplete core features, contradicting today’s clean `npx tsc --noEmit`. Leaving it untouched misleads reviewers and partners about baseline health.

## Action Plan & TODO

- [ ] **A1** Consolidate initial data bootstrapping so only `WeatherProvider` orchestrates auto-refresh. Hooks should either subscribe to a shared "initial fetch done" signal or accept a flag from context to skip their own first run.
- [ ] **A2** Plumb unit converters through hero components: use `useWeatherData` helpers for current temp, feels-like, wind, pressure, and ensure forecast highs/lows honor `preferences.temperatureUnit`.
- [ ] **A3** Move weather + settings strings into `en.json` / `pt-BR.json` and replace manual ternaries with `t(...)` calls (weather card, details grid, forecast cards, UV indicator, skin selector, settings section headers).
- [ ] **A4** Extend date/time utilities to accept locale + 24h preference, wire through `useSettings`, and update surfaces rendering timestamps.
- [ ] **A5** Retire or rewrite `docs/FRESH_EYES_AUDIT_2025.md` to reflect the current state (no TS errors, clarified open issues) so future audits start from accurate intel.

## Notes
- Sunscreen tracker + notification stack now compile, but we still need end-to-end testing before endorsing reminders. Flagging for a later, deeper pass once the core flow above is stable.
- No additional dependencies required for the outlined fixes; leverage existing hooks/helpers to keep footprint tidy.
