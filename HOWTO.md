# How To - Weather Sunscreen App

Practical guides for developers working with the Weather Sunscreen App.

## Internationalization (i18n) - v1.2.0

### Using Type-Safe i18n Keys

All weather-related content now uses type-safe i18n keys to prevent typos at compile time:

```typescript
import { I18N_KEYS } from '@/src/types/i18n';
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();

  // Type-safe: TypeScript validates the key at compile time
  const advisory = getWeatherAdvisory(condition, temp);
  const advisoryText = t(advisory); // Returns localized string

  const humidity = getHumidityLevel(65);
  const humidityLabel = t(humidity); // e.g., "Comfortable"
}
```

### Adding New Translations

1. **Add key to `src/types/i18n.ts`:**
```typescript
export const I18N_KEYS = {
  weather: {
    advisories: {
      thunderstorm: 'weather.advisories.thunderstorm',
      myNewAdvisory: 'weather.advisories.myNewAdvisory', // NEW
    }
  }
} as const;

export type AdvisoryKey = typeof I18N_KEYS.weather.advisories[keyof typeof I18N_KEYS.weather.advisories];
```

2. **Add translations to `src/i18n/en.json`:**
```json
{
  "weather": {
    "advisories": {
      "thunderstorm": "Thunderstorm warning - Seek shelter",
      "myNewAdvisory": "Your new advisory text"
    }
  }
}
```

3. **Add Portuguese translation to `src/i18n/pt-BR.json`:**
```json
{
  "weather": {
    "advisories": {
      "myNewAdvisory": "Seu novo texto de aviso"
    }
  }
}
```

4. **Use the key in utility functions:**
```typescript
export function getWeatherAdvisory(...): AdvisoryKey | null {
  if (myCondition) {
    return I18N_KEYS.weather.advisories.myNewAdvisory;
  }
  return null;
}
```

### Testing Translations

Ensure all keys exist in both languages:

```bash
npm test -- weather.test.ts
```

Test coverage validates:
- Key exists in en.json
- Key exists in pt-BR.json
- Functions handle edge cases (NaN, Infinity, out-of-range)

## Building for iOS Release - v1.2.0

### Option 1: Metro-Based Bundling (Recommended)

```bash
# Generate offline JavaScript bundle
./scripts/build-ios-bundle.sh

# This creates:
# - ios/main.jsbundle (JavaScript bundle)
# - ios/main.jsbundle.assets/ (Assets directory)

# Next steps in Xcode:
# 1. Open ios/weathersunscreenapp.xcworkspace
# 2. Connect iPhone
# 3. Select iPhone as build destination
# 4. Press ⌘R to build and run
```

### Option 2: Expo Export Method (Alternative)

```bash
# Use Expo's official export for better Expo Router compatibility
./scripts/build-ios-bundle-expo.sh

# Output:
# - ios/dist/ (Complete export)
# - ios/main.jsbundle (Copied for Xcode)
# - ios/main.jsbundle.assets/ (Assets)
```

### Option 3: Xcode Run Script Phase (CI/CD)

Add to Xcode build phases for automatic bundling:

1. Target → Build Phases
2. Click "+" → New Run Script Phase
3. Set shell script to: `${SRCROOT}/../scripts/xcode-bundle-react-native.sh`

This automatically bundles on every Xcode build (only if bundle doesn't exist).

## Input Validation in Utilities

All utility functions now validate inputs and handle edge cases gracefully:

```typescript
import { getHumidityLevel, getWindDescription, degreesToCardinal } from '@/src/utils';

// All of these work safely without throwing:
getHumidityLevel(NaN);        // Returns 'comfortable' (safe default)
getHumidityLevel(Infinity);   // Returns 'comfortable' (safe default)
getHumidityLevel(150);        // Clamps to 'veryHumid' (100 max)
getHumidityLevel(-10);        // Clamps to 'veryDry' (0 min)

getWindDescription(NaN);      // Returns 'calm' (safe default)
getWindDescription(-50);      // Returns 'calm' (safe default)

degreesToCardinal(NaN);       // Returns 'N' (safe default)
degreesToCardinal(380);       // Normalizes to 20° → 'NNE'
degreesToCardinal(-10);       // Normalizes to 350° → 'N'
```

Invalid inputs log a console warning in development for debugging:
```
⚠️ getHumidityLevel: Invalid humidity value 150, using comfortable default
```

## Running Tests

### Unit Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- weather.test.ts

# Watch mode (auto-rerun on changes)
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Test Coverage
Current v1.2.0 coverage:
- ✅ 31 comprehensive weather utility tests
- ✅ Boundary conditions (0-100 humidity, 0-360 degrees, etc.)
- ✅ Edge cases (NaN, Infinity, negative values)
- ✅ Translation file validation (both languages)
- ✅ 100% pass rate

## Debugging i18n Issues

### Key Not Found
Error: `key 'weather.advisory.thunderstorm' returned an object instead of string`

**Solution:** Check `src/i18n/en.json` and `src/i18n/pt-BR.json` - keys should have string values, not nested objects.

### Missing Translations
If a key exists in en.json but not pt-BR.json, tests will fail.

**Solution:** Run `npm test -- weather.test.ts` to see which translations are missing.

### Type Safety Errors
TypeScript error: `Argument of type 'string' is not assignable to parameter of type 'AdvisoryKey'`

**Solution:** Import from `I18N_KEYS` constant:
```typescript
// ✅ Correct
const key = I18N_KEYS.weather.advisories.thunderstorm;

// ❌ Wrong
const key = 'weather.advisories.thunderstorm';
```

## Metro Configuration

The `metro.config.js` enables offline bundling for:
- Release builds without Metro dev server
- CI/CD pipelines (EAS Build, GitHub Actions, etc.)
- Xcode run script phases
- Bundle size analysis

No configuration needed - it's automatically used by `expo run:ios:release` and build scripts.

## Common Commands

```bash
# Development
bun start                      # Start Expo dev server
bun run ios                    # Run on iOS simulator
bun run android                # Run on Android emulator

# Building
./scripts/build-ios-bundle.sh  # Create offline iOS bundle
bun run ios:release            # Release build with bundling

# Testing
npm test                       # Run all tests
npm test -- --watch           # Watch mode

# Version Management
bun run sync-versions          # Sync version from CHANGELOG.md
git tag v1.2.0               # Create release tag
```

## Resources

- **[CLAUDE.md](CLAUDE.md)** - Project overview and SDK 54 features
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes
- **[docs/AI_INTEGRATION.md](docs/AI_INTEGRATION.md)** - AI SDK setup
- **[docs/REF_DOC/docs_expo_dev/](docs/REF_DOC/docs_expo_dev/)** - Expo 54 docs
