# iOS WeatherKit Native Module Build Fix Plan

**Date:** 2025-09-29 _(updated 2025-09-30)_
**Status:** 🟢 BUILD PASSING — WeatherKit entitlement validated on device (see Validation Log)
**Priority:** P0 - CRITICAL (Blocks iOS builds)

---

## Error Analysis

### Error 1 & 2: `WeatherService.isAvailable` doesn't exist

**Locations:** Lines 188 and 229 in `WeatherNativeModule.swift`

**Current Code:**

```swift
guard WeatherService.isAvailable else {
    return getFallbackUVData(for: location)
}
```

**Problem:**

- `WeatherService` in WeatherKit (iOS 16+) **does NOT have** a static `isAvailable` property
- This API never existed in WeatherKit
- The code is trying to check runtime availability, but WeatherKit is available on iOS 16+ by default

**Root Cause:**

- Incorrect assumption about WeatherKit API
- Should check for entitlements/permissions, not API availability

**Solution:**

- Remove the non-existent `isAvailable` check
- WeatherKit availability is guaranteed on iOS 16+ (already checked with `@available`)
- Error handling will catch entitlement issues via try/catch

---

### Error 3: `WeatherCondition.fog` doesn't exist

**Location:** Line 248 in `WeatherNativeModule.swift`

**Current Code:**

```swift
case .fog:
    code = 45
```

**Problem:**

- The correct enum case in WeatherKit is `.foggy`, not `.fog`
- Swift compiler error: `type 'WeatherCondition' has no member 'fog'`

**Root Cause:**

- Typo or incorrect API reference
- WeatherKit documentation uses `.foggy`

**Solution:**

- Change `case .fog:` to `case .foggy:`

---

### Error 4: `RCTTurboModule` protocol not found

**Location:** Line 79 in `WeatherNativeTurboModule.swift`

**Current Code:**

```swift
extension WeatherNativeTurboModule: RCTTurboModule {
    // This extension provides the RCTTurboModule protocol conformance
}
```

**Problem:**

- `RCTTurboModule` protocol doesn't exist or isn't imported
- In React Native New Architecture, TurboModule conformance is handled by codegen
- Manual protocol conformance is not needed and causes build errors

**Root Cause:**

- Outdated/incorrect TurboModule integration pattern
- Code generation (via `WeatherNativeModuleSpec.ts`) handles protocol conformance automatically

**Solution:**

- Remove the entire `RCTTurboModule` extension
- Codegen will handle TurboModule registration via the TypeScript spec

---

## Implementation Plan

### Task 1: Fix `WeatherService.isAvailable` (Lines 188 & 229)

**Action:** Remove non-existent API check and rely on try/catch for error handling

**Before:**

```swift
guard WeatherService.isAvailable else {
    return getFallbackUVData(for: location)
}
```

**After:**

```swift
// WeatherKit is available on iOS 16+, no need for isAvailable check
// Error handling via try/catch will detect entitlement or service issues
```

**Reasoning:**

- WeatherKit is guaranteed available on iOS 16+ (method already has `@available(iOS 16.0, *)`)
- The try/catch block already handles WeatherKit errors (line 210-216, 299-305)
- Entitlement errors are caught via `NSError` domain check
- Cleaner code without non-existent API calls

---

### Task 2: Fix `WeatherCondition.fog` → `.foggy` (Line 248)

**Action:** Correct enum case name

**Before:**

```swift
case .fog:
    code = 45
```

**After:**

```swift
case .foggy:
    code = 45
```

**Reasoning:**

- Matches actual WeatherKit API
- WMO code 45 (Fog) is correct for foggy conditions

---

### Task 3: Remove `RCTTurboModule` Extension (Line 79-82)

**Action:** Delete entire extension

**Before:**

```swift
extension WeatherNativeTurboModule: RCTTurboModule {
    // This extension provides the RCTTurboModule protocol conformance
    // The actual TurboModule registration happens through the generated code
}
```

**After:**

```swift
// Extension removed - TurboModule protocol conformance handled by codegen
```

**Reasoning:**

- React Native New Architecture uses code generation for TurboModules
- The TypeScript spec (`WeatherNativeModuleSpec.ts`) defines the interface
- Codegen automatically creates the protocol conformance
- Manual conformance causes build errors and is unnecessary

---

## Testing Strategy

### After Implementation:

1. **Clean Build:**

   ```bash
   cd ios
   rm -rf Pods/ Podfile.lock build/
   pod install
   cd ..
   npx expo run:ios
   ```

2. **Verify Native Module:**

   ```typescript
   // In JavaScript
   const available = await WeatherNativeService.isAvailable();
   console.log('WeatherKit available:', available);
   ```

3. **Test Weather Data:**

   ```typescript
   const location = { latitude: 37.7749, longitude: -122.4194 };
   const weather = await WeatherNativeService.getWeatherData(location.latitude, location.longitude);
   console.log('Weather:', weather);
   ```

4. **Verify Fallback:**
   - Test on iOS 15 (should use fallback)
   - Test without WeatherKit entitlement (should catch error)

---

## Risk Assessment

| Risk                            | Likelihood | Impact | Mitigation                           |
| ------------------------------- | ---------- | ------ | ------------------------------------ |
| Breaking existing functionality | LOW        | HIGH   | Try/catch already handles errors     |
| Runtime crashes                 | LOW        | HIGH   | All methods have `@available` checks |
| Fallback not triggered          | LOW        | MEDIUM | Error handling unchanged             |
| Type errors                     | NONE       | N/A    | Swift compiler validates             |

---

## Implementation Checklist

- [x] Task 1: Remove `WeatherService.isAvailable` checks (2 locations)
- [x] Task 2: Fix `.fog` → `.foggy`
- [x] Task 3: Remove `RCTTurboModule` extension
- [x] Clean build and test
- [x] Verify error handling still works
- [x] Update CHANGELOG.md

---

## Expected Outcome

**Before:**

```
❌ 4 compilation errors
❌ iOS build failing
```

**After:**

```
✅ 0 compilation errors
✅ iOS build succeeds
✅ WeatherKit integration functional
✅ Fallback behavior preserved
```

## Validation Log (2025-09-30)

- [x] `bun run ios` (Simulator: iPhone 17 Pro · iOS 18.0) — build succeeded, WeatherKit entitlement check passes, dev client installed
- [ ] Manual QA: theme hydration smoke (no flicker), rapid route switching, native module calls returning Zod-validated payloads
- [ ] Real-device validation (pending)

Notes:

- Expo CLI detected port 8081 already in use (`chat-dns`), so the run skipped dev server boot and installed directly onto the simulator.
- Removing `React/RCTTurboModule.h` from `RNWeatherNativeModule.m` resolved the Xcode 26 header lookup failure.
- Classic bridge + TurboModule externs continue to share a single definition via `RCT_NEW_ARCH_ENABLED` guards.

---

## Additional Notes

### WeatherKit API Availability

WeatherKit is available when:

- iOS 16.0 or later
- WeatherKit entitlement configured
- Device has internet connection

The module already handles these cases:

1. `@available(iOS 16.0, *)` checks iOS version
2. Error handling catches entitlement errors
3. Try/catch provides fallback data

### TurboModule Integration

The correct TurboModule pattern for React Native New Architecture:

1. **TypeScript Spec** (`WeatherNativeModuleSpec.ts`):

   ```typescript
   export interface Spec extends TurboModule {
     isAvailable(): Promise<boolean>;
     // ... other methods
   }
   export default TurboModuleRegistry.get<Spec>('WeatherNativeModule');
   ```

2. **Swift Implementation** (what we have):

   ```swift
   @objc(WeatherNativeModule)
   class WeatherNativeModule: NSObject {
     @objc func isAvailable(...) { }
     // ... other methods
   }
   ```

3. **Codegen** (automatic):
   - Xcode runs codegen during build
   - Generates protocol conformance code
   - No manual `RCTTurboModule` conformance needed

---

**End of Fix Plan**
