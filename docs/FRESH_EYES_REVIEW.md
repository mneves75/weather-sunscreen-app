# Fresh Eyes Review

> Date: 2025-10-02  
> Reviewer: GPT-5 Codex (Principal Engineer)

## Findings

| ID | Severity | Evidence | Impact | Quick Fix | Proper Fix | Suggested Tests | Est. Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-001 | RESOLVED | `tsc --noEmit` failures across `app/(tabs)/**` and `src/components/**` | Type system broken; build fails; app likely crashes where types misalign | Added missing `surfaceTint` type, fixed accessibility roles, adjusted FlashList usage, re-exported utilities | Jest component coverage to be added; `npx tsc --noEmit` (pass) | Low |
| F-002 | RESOLVED | `src/utils/index.ts` exporting only performance utilities | Runtime undefined errors for weather/UV UI | Re-exported date, weather, units, uv helpers | Add targeted unit tests; `npx tsc --noEmit` | Low |
| F-003 | RESOLVED | Unsupported accessibility roles (`"article"`, `"group"`) | React Native warnings, a11y regression | Replaced with supported labels or removed roles; added descriptive labels | Add a11y regression tests/manual QA | Low |
| F-004 | RESOLVED | `GlassView` type mismatch & missing `surfaceTint` | Type errors; inconsistent tint | Added `surfaceTint` to theme types; aligned glass components with `GlassStyle`; default tint fallbacks | Component snapshot tests; `npx tsc --noEmit` | Low |
| F-005 | RESOLVED | FlashList `estimatedItemSize` prop unsupported in current typings | Build blocked | Removed unsupported props; restructured `MessageList` data shape | FlashList render tests; `npx tsc --noEmit` | Low |
| F-006 | RESOLVED | Duplicate `GlassCard` re-export | Type error | Adjusted `src/components/index.ts` exports | `npx tsc --noEmit` | Low |
| F-007 | RESOLVED | Theme tokens/types drift (`surfaceTint`) | Type mismatch; tint undefined | Synced type + tokens usage | Theme regression tests; `npx tsc --noEmit` | Low |
| F-008 | OPEN | Missing lint/test scripts | Tooling gap | Documented need; not implemented in this pass | N/A | High |
| F-009 | OPEN | Jest config/coverage gap | Testing deficit | Documented; pending future work | N/A | High |
| F-010 | OPEN | Secret scanning tooling absent | Security blind spot | Documented manual fallback requirement | N/A | Medium |
| F-011 | INFO | BackgroundTasks console log already dev-guarded | Low impact | No change needed | N/A | Low |
| F-012 | RESOLVED | Outdated `expo export` command | Build reproducibility risk | Updated plan to correct command | N/A | Low |
| F-013 | RESOLVED | Docs vs type drift (`surfaceTint`) | Confusion | Types aligned; docs consistent | N/A | Low |
| F-014 | RESOLVED | PLAN iteration log empty | Tracking gap | Populated log with steps | N/A | Low |
| F-015 | OPEN | ESLint config missing | Tooling gap | Documented future requirement | N/A | Medium |

## Summary
- Critical TypeScript blockers resolved; `npx tsc --noEmit` now passes.
- Utility barrels, glass components, and FlashList usage aligned with current SDK typings.
- Accessibility roles corrected with descriptive labels and supported roles.
- Remaining gaps: lint/test scripts, Jest configuration, and automated secret scan tooling need follow-up.

Next steps: implement lint/test automation and coverage enforcement, add Jest config, and formalize secret scanning tooling per repo standards.

