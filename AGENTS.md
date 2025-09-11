# Repository Guidelines

## Project Structure & Module Organization
- `src/` — App code (TypeScript):
  - `components/ui`, `components/icons` — Presentational UI and SVGs.
  - `context/` — React Context providers.
  - `navigation/` — Router entry + `screens/` (one screen per file).
  - `services/` — Business logic (`weatherService.ts`, `locationService.ts`).
  - `types/`, `i18n/` — Shared types and locales (`en.json`, `pt-BR.json`).
- `modules/` — Native bridges: `weather-native-module/`, `liquid-glass-native/` (iOS 26 Liquid Glass).
- `ios/`, `android/` — Native projects for device builds; avoid manual edits unless needed.
- `assets/`, `scripts/`, `docs/`, `project-rules/` — Media, tooling, docs, and automation.

## Build, Test, and Development Commands
- Install: `bun install` (fast) or `npm install`.
- Start dev (Expo): `npm start`.
- Run apps: `npm run ios` | `npm run android` | `npm run web`.
- Tests: `npm test` (Jest), watch: `npm run test:watch`.
- Types: `npm run typecheck`.
- iOS maintenance: `npm run fix-pods`, `npm run clean-ios`.
- EAS builds: `npx eas build --platform ios|android --profile development|preview|production`.

## Coding Style & Naming Conventions
- TypeScript (strict), 2‑space indent, keep semicolons.
- ESLint + Prettier enforce style (`.eslintrc.js`, `.prettierrc`).
- Names: Components/Contexts PascalCase (`WeatherScreen.tsx`, `ThemeContext.tsx`).
- Services: camelCase + `Service` suffix (`loggerService.ts`).
- Icons `XxxIcon.tsx`; Screens `XxxScreen.tsx`.
- Keep UI presentational; move logic into `services/`. Localize strings in `en` and `pt-BR`.

## Testing Guidelines
- Frameworks: Jest + `@testing-library/react-native`.
- File names: `*.test.ts` / `*.test.tsx`, colocated or under `src/__tests__/`.
- Run: `npm test`; keep tests deterministic; mock network/native calls as needed.

## Commit & Pull Request Guidelines
- Conventional Commits required: `feat:`, `fix:`, `docs:`, `chore:`, etc. (commitlint + husky).
- PRs: clear description, linked issues, scope focused; include screenshots/GIFs for UI, test steps, and platforms tested (iOS/Android/Web).

## Security & Configuration Tips
- Never commit secrets. Use EAS secrets; runtime config via `app.json > extra`.
- Android builds require Java 17. Review `Info.plist`/`AndroidManifest.xml` when changing location/notifications.
- iOS 26 Liquid Glass is runtime‑gated; prefer system components over custom backgrounds.

## Contributor Tips
- Prefer structural search: `sg --lang ts|tsx -p '<pattern>'`.
- Keep changes minimal and focused; update docs/tests when touching public APIs.
