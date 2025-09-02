# iOS Build Fix for Expo SDK 54 Preview

## Problem Summary

When upgrading to Expo SDK 54 preview with React Native 0.81.0, iOS builds fail with:

- xcodebuild error code 65
- Missing `conversions.h` header file
- React Native Fabric header resolution issues

## Root Cause

The issue stems from:

1. **Precompiled XCFrameworks**: React Native 0.81 ships with precompiled frameworks that have compatibility issues in preview releases
2. **Header Path Resolution**: The New Architecture (Fabric) expects certain headers in specific locations
3. **SDK Preview Status**: Known issues in SDK 54 preview that will be fixed in stable release

## Solution

### Configuration Changes

#### 1. Update app.json

Add `buildReactNativeFromSource: true` to bypass precompiled framework issues:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "16.0",
            "newArchEnabled": true,
            "useFrameworks": "static",
            "buildReactNativeFromSource": true // Critical for SDK 54 preview
          },
          "android": {
            "newArchEnabled": true,
            "compileSdkVersion": 36,
            "targetSdkVersion": 36
          }
        }
      ]
    ]
  }
}
```

#### 2. Create Header Fix Script

Save as `scripts/fix-ios-headers.sh`:

```bash
#!/bin/bash
set -e

IOS_DIR="$(pwd)/ios"
GENERATED_HEADERS="$IOS_DIR/build/generated/ios"

# Create conversions.h for image components
mkdir -p "$GENERATED_HEADERS/react/renderer/components/image"
cat > "$GENERATED_HEADERS/react/renderer/components/image/conversions.h" << 'EOF'
#pragma once
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/propsConversions.h>
namespace facebook::react {
  enum class ResizeMode { Cover, Contain, Stretch, Center, Repeat };
}
EOF

echo "✅ iOS headers fixed"
```

### Build Process

1. **Align Packages for SDK 54 (after GA)**:

```bash
npx expo install
```

This pins compatible versions for Expo SDK 54. Prefer this over manual bumps when upgrading.

2. **Clean Install**:

```bash
rm -rf ios/Pods ios/Podfile.lock ios/build
rm -rf node_modules bun.lock
bun install
```

3. **Install Pods** (Note: This may be slow):

```bash
cd ios && pod install --repo-update
```

4. **Apply Header Fixes**:

```bash
./scripts/fix-ios-headers.sh
```

5. **Build**:

```bash
bun run ios
```

### Alternative Solutions

If the above doesn't work:

#### Option 1: Use EAS Build

```bash
npx eas build --platform ios --profile development
```

EAS Build handles these edge cases better than local builds.

#### Option 2: Open in Xcode

```bash
open ios/WeatherSunscreen.xcworkspace
```

- Clean build folder (Shift+Cmd+K)
- Build directly from Xcode for better error messages

#### Option 3: Wait for Stable Release

When SDK 54 stable is available, re-run `npx expo install` to pin final versions before building.

## Known Issues

1. **Pod Install Speed**: CocoaPods installation can be extremely slow (5-10 minutes)
2. **Precompiled Frameworks**: Cannot submit to App Store with current preview
3. **Header Resolution**: Fabric headers need manual symlinks

## Android Status

✅ Android builds work perfectly with the current configuration

## Recommendations

For production apps:

1. Use EAS Build for iOS releases
2. Wait for SDK 54 stable before updating production apps
3. Keep `buildReactNativeFromSource: true` until stable release

## References

- [Expo SDK 54 Beta Changelog](https://expo.dev/changelog/sdk-54-beta)
- [React Native 0.81 Release Notes](https://reactnative.dev/blog/2025/08/12/react-native-0.81)
- [GitHub Issue: iOS Build with Missing Headers](https://github.com/expo/expo/actions/runs/17083862848)
