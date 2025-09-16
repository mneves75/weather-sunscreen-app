# CRUSH.md - Weather Sunscreen App Guidelines

## Commands

### Development

- Install: `bun install` (preferred) or `npm install`.
- Start: `bun start` or `npm start`.
- Run: `bun run ios` | `bun run android` | `bun run web`.
- iOS fixes: `bun run fix-pods` | `bun run clean-ios`.
- Version sync: `bun run sync-versions`.
  Single test: `npm test -- --testNamePattern="Test Name"` or `npm test src/services/weatherService.test.ts`.
  E2E (Maestro): `npx maestro test maestro/flows/*`.
  Android: Set JAVA_HOME=/opt/homebrew/opt/openjdk@17/... before `bun run android`.- Single test: `npm test -- path/to/file.test.tsx` or `npm test -- --testNamePattern="Test Name"`.
- Coverage: `npm test -- --coverage`.
- Native iOS: `cd ios && xcodebuild test -scheme WeatherSunscreen`.

### Build & Lint

- Lint: `bun run lint`.
- Typecheck: `bun run typecheck`.
- E2E (Maestro): `npx maestro test maestro/flows/ios-launch.yaml`.

## Code Style

### General

- TypeScript (strict mode, tsconfig.json extends expo/tsconfig.base).
- 2-space indent, semicolons required.
- ESLint + Prettier enforced (.eslintrc.js, .prettierrc).
- No console.log; use loggerService.ts for structured logging.

### Naming Conventions

- Components/Screens/Contexts: PascalCase (e.g., WeatherScreen.tsx, ThemeProvider.tsx).
- Services: camelCase + Service suffix (e.g., weatherService.ts).
- Icons: XxxIcon.tsx; Variables: camelCase; Constants: UPPER_SNAKE_CASE.
- Keep UI presentational; business logic in services/.

### Imports & Formatting

- Absolute imports from src/ where possible (e.g., import { WeatherService } from '@/services/weatherService').
- Group imports: React/third-party, then local (alphabetical).
- Multi-line for readability; guard clauses, early returns.
- Localize strings in i18n/locales/en.json and pt-BR.json.

### Types & Error Handling

- Avoid any; explicit types on exports/public APIs (src/types/\*.ts).
- Typed errors (e.g., extend Error); use ErrorBoundary for UI.
- Input validation in services; sanitized messages (no coords/secrets).
- Immutable state updates; useReducer for contexts.

### Cursor Rules Integration

- Project Structure: app/ for Expo Router; src/ for code (components/ui, services/, types/).
- TypeScript: Prefer functional components/hooks; no direct AsyncStorage.
- Navigation: Expo Router v4 file-based; screens in app/(tabs)/.
- Security: HTTPS only, no secrets in code; validate inputs in native modules.
- State: Contexts (WeatherContext, SunscreenContext) + services for persistence.

### Audit Checklist

- Phase 1: Verified env, no console logs, fixed CRUSH.md.
- Phase 2: Refactored services/navigation.
- Phase 3: 90%+ coverage.
- Phase 4: Docs optimized.
- New Architecture enabled (TurboModules in src/specs/).
- Liquid Glass: Use expo-glass-effect (no custom native).
- Permissions: Location WhenInUse only; review Info.plist/AndroidManifest.xml.
- Commits: Conventional (feat:, fix:, etc.); no pushes.

Updated: 9/12/2025
