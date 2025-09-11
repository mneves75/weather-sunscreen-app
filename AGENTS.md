# Repository Guidelines

## Project Structure & Module Organization

- `app/` — Expo Router file-based navigation (replaces legacy `src/navigation/`).
- `src/` — App code (TypeScript):
  - `components/ui`, `components/icons` — Presentational UI and SVGs.
  - `context/` — React Context providers.
  - `services/` — Business logic (`weatherService.ts`, `locationService.ts`).
  - `types/`, `i18n/` — Shared types and locales (`en.json`, `pt-BR.json`).
- `modules/` — Native bridges: `weather-native-module/`.
  - Note: Liquid Glass now uses official Expo module `expo-glass-effect` (no custom native module).
- `ios/`, `android/` — Native projects for device builds; avoid manual edits unless needed.
- `assets/`, `scripts/`, `docs/`, `project-rules/` — Media, tooling, docs, and automation.

## Build, Test, and Development Commands

- Install: `bun install` (preferred) or `npm install` fallback.
- Start dev (Expo): `bun start` or `npm start`.
- Run apps: `bun run ios` | `bun run android` | `bun run web`.
- Tests: `bun test` (Jest), watch: `bun run test:watch`.
- Types: `bun run typecheck`.
- iOS maintenance: `bun run fix-pods`, `bun run clean-ios`.
- EAS builds: `npx eas build --platform ios|android --profile development|preview|production`.

## Expo SDK 54 & New Architecture (v3.0.0)

- **Current Status**: Expo SDK 54.0.0 stable, React Native 0.81.4 with New Architecture enabled
- **Breaking Changes**: React downgraded 19.1.0 → 18.3.1, navigation moved to Expo Router v4
- **Native Modules**: TurboModule specs in `src/specs/`, full New Architecture compatibility
- **iOS Requirements**: Xcode 16+ (16.4 recommended), iOS 16+ deployment, iOS 26 Liquid Glass support
- **Performance**: 40% faster builds, 83% battery efficiency (10Hz motion tracking)

## iOS Build & Troubleshooting

- Critical fixes: `bun run fix-pods`, `scripts/fix-fabric-headers.sh`
- Security: ✅ All vulnerabilities fixed, Actor-based thread safety
- EAS Build: Use image `macos-sequoia-15.6-xcode-16.4` for production

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
- Use `npm test` (Jest). Watch: `npm test -- --watch`. Keep tests deterministic; mock network/native calls as needed.

## Commit & Pull Request Guidelines

- Conventional Commits required: `feat:`, `fix:`, `docs:`, `chore:`, etc. (commitlint + husky).
- PRs: clear description, linked issues, scope focused; include screenshots/GIFs for UI, test steps, and platforms tested (iOS/Android/Web).

## Security & Configuration Tips

- Never commit secrets. Use EAS secrets; runtime config via `app.json > extra`.
- Android builds require Java 17: Install via `brew install openjdk@17`, then run Android with:
  ```bash
  JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home bun run android
  ```
- Review `Info.plist`/`AndroidManifest.xml` when changing location/notifications.
- iOS 26 Liquid Glass is runtime‑gated; prefer system components over custom backgrounds.

## Contributor Tips

- Prefer structural search: `sg --lang ts|tsx -p '<pattern>'` (ast-grep for syntax-aware matching).
- Keep changes minimal and focused; update docs/tests when touching public APIs.

## Troubleshooting Quick Reference

### Jest Test Failures

- **MUST** use `npm test` not `bun test` (Jest incompatible with Bun)
- Check babel configuration for Flow types
- Ensure `__DEV__` is defined in jest.setup.ts

### iOS Build Issues

- Run `scripts/fix-fabric-headers.sh` for header errors
- Use `bun run fix-pods` for CocoaPods issues
- Check Xcode version (16+ required, 16.4 recommended)

### Android Build Issues

- Ensure Java 17 is installed and configured (see Security section above)
- Check gradle.properties for `newArchEnabled=true`
- Clear gradle cache: `cd android && ./gradlew clean`

### E2E Testing with Maestro

- iOS launch: `npx maestro test maestro/flows/ios-launch.yaml`
- Liquid Glass: `npx maestro test maestro/flows/liquid-glass-and-theme.yaml`
