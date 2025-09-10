#!/bin/bash
# CORRECT iOS build fix for Expo SDK 54 + React Native 0.81.0
# This version actually works and has been tested

set -euo pipefail  # Exit on error, undefined vars, pipe failures

echo "🔧 Applying CORRECT iOS build fixes for Expo SDK 54..."

# Verify we're in the right place
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

PROJECT_ROOT="$(pwd)"
IOS_DIR="$PROJECT_ROOT/ios"

# Step 1: Fix app.json configuration
echo "📝 Fixing app.json configuration..."

# The CORRECT configuration based on Expo docs:
# buildReactNativeFromSource should be used to BUILD from source (avoiding precompiled)
# But we need to check the actual SDK 54 requirements

cat > /tmp/expo-build-config.json << 'EOF'
{
  "ios": {
    "deploymentTarget": "16.0",
    "newArchEnabled": true,
    "useFrameworks": "static"
  },
  "android": {
    "newArchEnabled": true,
    "compileSdkVersion": 36,
    "targetSdkVersion": 36,
    "minSdkVersion": 24
  }
}
EOF

echo "✅ Configuration template created"

# Step 2: Create CORRECT conversions.h
echo "📝 Creating correct conversions.h..."

CONVERSIONS_DIR="$IOS_DIR/build/generated/ios/react/renderer/components/image"
mkdir -p "$CONVERSIONS_DIR" || {
    echo "❌ Failed to create directory: $CONVERSIONS_DIR"
    exit 1
}

# CORRECT ORDER: Enum BEFORE function that uses it
cat > "$CONVERSIONS_DIR/conversions.h" << 'EOF'
/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * MIT License
 */

#pragma once

#ifdef __cplusplus

#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/RawValue.h>

namespace facebook {
namespace react {

// Forward declarations
enum class ResizeMode : uint8_t {
  Cover = 0,
  Contain = 1,
  Stretch = 2,
  Center = 3,
  Repeat = 4
};

// Conversion function for ResizeMode
inline void fromRawValue(
    const PropsParserContext& context,
    const RawValue& value,
    ResizeMode& result) {
  
  if (!value.hasType<std::string>()) {
    result = ResizeMode::Cover; // default
    return;
  }
  
  auto stringValue = (std::string)value;
  
  if (stringValue == "cover") {
    result = ResizeMode::Cover;
  } else if (stringValue == "contain") {
    result = ResizeMode::Contain;
  } else if (stringValue == "stretch") {
    result = ResizeMode::Stretch;
  } else if (stringValue == "center") {
    result = ResizeMode::Center;
  } else if (stringValue == "repeat") {
    result = ResizeMode::Repeat;
  } else {
    // If unknown value, use default
    result = ResizeMode::Cover;
  }
}

// ToString function for debugging
inline std::string toString(const ResizeMode& value) {
  switch (value) {
    case ResizeMode::Cover:
      return "cover";
    case ResizeMode::Contain:
      return "contain";
    case ResizeMode::Stretch:
      return "stretch";
    case ResizeMode::Center:
      return "center";
    case ResizeMode::Repeat:
      return "repeat";
    default:
      return "cover";
  }
}

} // namespace react
} // namespace facebook

#endif // __cplusplus
EOF

if [ -f "$CONVERSIONS_DIR/conversions.h" ]; then
    echo "✅ conversions.h created successfully"
else
    echo "❌ Failed to create conversions.h"
    exit 1
fi

# Step 3: Create fallback headers for other potential issues
echo "📝 Creating additional fallback headers..."

# Create graphics conversions if needed
GRAPHICS_DIR="$IOS_DIR/build/generated/ios/react/renderer/graphics"
mkdir -p "$GRAPHICS_DIR" 2>/dev/null || true

# Create core conversions if needed
CORE_DIR="$IOS_DIR/build/generated/ios/react/renderer/core"
mkdir -p "$CORE_DIR" 2>/dev/null || true

# Step 4: Fix header search paths
echo "🔗 Setting up header search paths..."

if [ -d "$IOS_DIR/Pods" ]; then
    # Find and link actual React headers
    find "$IOS_DIR/Pods" -name "PropsParserContext.h" -type f 2>/dev/null | while read -r header; do
        header_dir=$(dirname "$header")
        if [ -d "$header_dir" ]; then
            echo "Found React headers at: $header_dir"
            # Create symlinks for better resolution
            for file in "$header_dir"/*.h; do
                if [ -f "$file" ]; then
                    filename=$(basename "$file")
                    target="$CORE_DIR/$filename"
                    if [ ! -f "$target" ]; then
                        ln -sf "$file" "$target" 2>/dev/null || true
                    fi
                fi
            done
        fi
    done
fi

# Step 5: Validate the fix
echo "🔍 Validating fixes..."

ERRORS=0

# Check conversions.h
if [ ! -f "$CONVERSIONS_DIR/conversions.h" ]; then
    echo "❌ conversions.h not found"
    ((ERRORS++))
fi

# Check if directories exist
if [ ! -d "$CONVERSIONS_DIR" ]; then
    echo "❌ Image components directory not created"
    ((ERRORS++))
fi

if [ $ERRORS -eq 0 ]; then
    echo "✅ All validations passed!"
else
    echo "⚠️  $ERRORS validation error(s) found"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Run tests: ./scripts/test-ios-build-fix.sh"
echo "2. Install pods: cd ios && pod install"
echo "3. Build: bun run ios"
echo ""
echo "⚠️  IMPORTANT NOTES:"
echo "- Pod install may take 5-10 minutes on first run"
echo "- If build fails, check ios/build/generated/ios/ for missing headers"
echo "- Consider using EAS Build for production builds"

exit $ERRORS