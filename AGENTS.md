# Repository Guidelines

## Project Structure & Module Organization

- `src/`: App code.
  - `components/ui`, `components/icons`: Reusable UI and SVG icons.
  - `context/`: React Context providers.
  - `navigation/`: `index.tsx` + `screens/` (one screen per file).
  - `services/`: Business logic (e.g., `weatherService.ts`, `locationService.ts`).
  - `types/`: Shared TypeScript types.
  - `i18n/`: Localization (`locales/en.json`, `pt-BR.json`).
- `modules/weather-native-module/`: Native iOS/Android code + TS bridge.
- `assets/`: App icons, splash, images.
- `android/`, `ios/`: Native projects for device builds.
- `scripts/`: Build/dev fixes and tooling.
- `docs/`, `project-rules/`: Reference docs and repo automation rules.

## Build, Test, and Development Commands

- Install deps: `bun install` (recommended) or `npm install`.
- Start dev (Expo): `npm start`.
- Run apps: `npm run ios` | `npm run android` | `npm run web`.
- EAS builds: `npx eas build --platform ios|android --profile development|production` (see `eas.json`).
- Versioning: `npm run sync-versions`, preview with `npm run sync-versions:dry`.
- iOS maintenance: `npm run fix-pods`, `npm run clean-ios`.
- Tests (if present): `npm test`.

## Coding Style & Naming Conventions

- Language: TypeScript (strict). Indent 2 spaces; keep semicolons.
- Lint/format: ESLint + Prettier (`.eslintrc.js`, `.prettierrc`).
- Components/Contexts: PascalCase (`WeatherScreen.tsx`, `ThemeContext.tsx`).
- Services: camelCase filename with `Service` suffix (`loggerService.ts`).
- Icons: `XxxIcon.tsx`; Screens: `XxxScreen.tsx`.
- Keep UI presentational; move logic to `services/`. Localize strings in `en` and `pt-BR`.

## Testing Guidelines

- Automated tests are not mandatory yet. Prefer Jest + `@testing-library/react-native` if adding.
- Name tests `*.test.ts(x)` colocated or under `src/__tests__/`.
- Manual checks: iOS/Android/Web, location permissions (grant/deny), offline behavior, error boundaries. Use `loggerService` for debugging.

## Search & Tooling Preferences

- Structural/code-aware search: Prefer `ast-grep` (`sg`) for syntax-aware matching.
  - Default to: `sg --lang <language> -p '<pattern>'` (use the appropriate language such as `--lang ts`, `--lang tsx`, `--lang js`, `--lang swift`, `--lang java`, etc.).
  - Example: Find all React import specifiers in TSX files:
    - `sg --lang tsx -p 'import { $X } from "react"'`
- Avoid falling back to plain-text tools like `rg`/`grep` for structural queries unless explicitly requested.

## Commit & Pull Request Guidelines

- Conventional Commits required: `feat:`, `fix:`, `docs:`, etc. Examples: `fix: resolve iOS pod issue`, `docs: update changelog for 1.0.1`.
- Commit linting via Husky/commitlint is configured; keep messages clean and scoped.
- PRs: clear description, linked issues, screenshots/GIFs for UI, test steps, and platforms tested (iOS/Android/Web). Keep scope focused and follow structure/naming rules.

## Security & Configuration Tips

- Never commit secrets. Use EAS secrets and `app.json` `extra` for runtime config.
- Android builds require Java 17 (scripts set `JAVA_HOME`).
- Review permissions in `Info.plist` and `AndroidManifest.xml` when changing location/notifications.
