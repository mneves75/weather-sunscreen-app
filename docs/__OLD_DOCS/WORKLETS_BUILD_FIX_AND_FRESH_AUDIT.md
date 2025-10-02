# Worklets Build Fix & Fresh Audit — October 1, 2025

## Objective
Deliver a laser-focused round of fixes that eliminate the remaining freshness issues flagged during the audit, lock down the initial data fetch cycle, and ensure user-facing error states are fully localized.

## Action Plan Overview
- Stabilize first-load behavior across weather, forecast, and UV hooks so they never thrash the network when data is absent or errors occur.
- Ensure all home tab surfaces display translated loading and error copy sourced from i18n dictionaries rather than hard-coded fallbacks.
- Guard the aggregated refresh pipeline to prevent overlapping `refreshAll` executions and emit clearer diagnostics for postmortem work.
- Finish with a TypeScript pass to guarantee the tightened contracts compile cleanly.

## Detailed TODO Checklist
- [x] **T1 – Harden initial fetch hooks**
  - Introduce per-hook refs that guarantee only one automatic fetch attempt per location change.
  - Reset the guard whenever coordinates materially change so new locations still bootstrap automatically.
- [x] **T2 – Localize home surface states**
  - Swap ad-hoc locale branching for `useTranslation` calls in `weather.tsx`, `uv.tsx`, and `forecast.tsx`.
  - Add any missing strings to `en.json` and `pt-BR.json` (loading, data failures, empty states).
- [x] **T3 – Protect `refreshAll` orchestration**
  - Add a lightweight concurrency guard in `WeatherContext` so combined refreshes do not pile up.
  - Replace index-based logging with source-aware diagnostics to speed up troubleshooting.
- [x] **T4 – Verification**
  - Run `npx tsc --noEmit` from the repo root to ensure the tightened types pass.
  - Manually spot-check the updated plan and code paths for clarity.

## Validation Plan
1. Execute the TypeScript compiler check described in T4.
2. Review hooks and screens to confirm the guard + localization logic matches the plan.
3. Update the checklist above to reflect completion status before final handoff.

## Validation Results (October 1, 2025)
- [x] `npx tsc --noEmit`
- [x] Manual spot-check of weather, forecast, and UV screens to confirm localized messaging
- [x] Confirmed initial fetch guards reset on coordinate changes via code inspection

## Notes
- All changes must remain Expo-compatible and avoid introducing additional dependencies.
- New strings should maintain the existing tone and style in both locales.
- Keep logging improvements concise—utility for debugging should not come at the cost of noise.
