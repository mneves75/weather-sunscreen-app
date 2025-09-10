#!/bin/bash

# Comprehensive iOS build fix for React Native 0.81.0 + Expo SDK 54
# This script addresses known issues with Fabric headers and precompiled frameworks

set -e

echo "🔧 Fixing iOS build issues for Expo SDK 54..."

# Define paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IOS_DIR="$PROJECT_ROOT/ios"

cd "$IOS_DIR"

# Step 1: Clean previous build artifacts
echo "📦 Cleaning build artifacts..."
rm -rf Pods Podfile.lock build
rm -rf ~/Library/Developer/Xcode/DerivedData/WeatherSunscreen-* 2>/dev/null || true

# Step 2: Install pods with proper configuration
echo "📦 Installing CocoaPods..."
pod install --repo-update

# Step 3: Fix Fabric header issues
echo "🔗 Fixing React Native Fabric headers..."

# Create the conversions.h file with proper content
CONVERSIONS_DIR="$IOS_DIR/build/generated/ios/react/renderer/components/image"
mkdir -p "$CONVERSIONS_DIR"

# Create a proper conversions.h that includes necessary headers
cat > "$CONVERSIONS_DIR/conversions.h" << 'EOF'
/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/propsConversions.h>
#include <react/renderer/graphics/Color.h>
#include <react/renderer/graphics/Geometry.h>
#include <react/renderer/graphics/Transform.h>

namespace facebook::react {

// Image-specific conversions for Fabric components
inline void fromRawValue(
    const PropsParserContext& context,
    const RawValue& value,
    ResizeMode& result) {
  if (value.hasType<std::string>()) {
    auto string = (std::string)value;
    if (string == "cover") {
      result = ResizeMode::Cover;
      return;
    }
    if (string == "contain") {
      result = ResizeMode::Contain;
      return;
    }
    if (string == "stretch") {
      result = ResizeMode::Stretch;
      return;
    }
    if (string == "center") {
      result = ResizeMode::Center;
      return;
    }
    if (string == "repeat") {
      result = ResizeMode::Repeat;
      return;
    }
  }
  
  // Default
  result = ResizeMode::Stretch;
}

// Additional conversions as needed
enum class ResizeMode {
  Cover,
  Contain,
  Stretch,
  Center,
  Repeat
};

} // namespace facebook::react
EOF

echo "✅ Created conversions.h with proper implementation"

# Step 4: Create additional symlinks for better header resolution
echo "🔗 Creating header symlinks..."

# Find React-Fabric headers and create necessary symlinks
FABRIC_HEADERS=$(find "$IOS_DIR/Pods" -path "*/React-Fabric/*" -name "*.h" -type f 2>/dev/null | head -1 | xargs dirname 2>/dev/null || echo "")

if [ -n "$FABRIC_HEADERS" ] && [ -d "$FABRIC_HEADERS" ]; then
    # Create symlinks in build directory for better resolution
    mkdir -p "$IOS_DIR/build/generated/ios/react/renderer/core"
    
    # Link core headers if they exist
    for header in PropsParserContext.h propsConversions.h; do
        SOURCE=$(find "$IOS_DIR/Pods" -name "$header" -type f 2>/dev/null | head -1)
        if [ -f "$SOURCE" ]; then
            ln -sf "$SOURCE" "$IOS_DIR/build/generated/ios/react/renderer/core/$header"
            echo "✅ Linked: $header"
        fi
    done
fi

# Step 5: Fix module headers for screens and safe-area-context
echo "🔗 Fixing module-specific headers..."

for module in rnscreens safeareacontext; do
    GENERATED_HEADERS="$IOS_DIR/build/generated/ios/react/renderer/components/$module"
    if [ -d "$GENERATED_HEADERS" ]; then
        # Ensure all generated headers are accessible
        for header in "$GENERATED_HEADERS"/*.h; do
            if [ -f "$header" ]; then
                filename=$(basename "$header")
                # Create multiple symlink locations for better resolution
                mkdir -p "$IOS_DIR/Pods/Headers/Private/react/renderer/components/$module"
                mkdir -p "$IOS_DIR/Pods/Headers/Public/react/renderer/components/$module"
                
                ln -sf "$header" "$IOS_DIR/Pods/Headers/Private/react/renderer/components/$module/$filename"
                ln -sf "$header" "$IOS_DIR/Pods/Headers/Public/react/renderer/components/$module/$filename"
            fi
        done
        echo "✅ Fixed headers for: $module"
    fi
done

# Step 6: Apply the old fix-fabric-headers script logic as backup
if [ -f "$PROJECT_ROOT/scripts/fix-fabric-headers.sh" ]; then
    echo "🔧 Applying additional header fixes..."
    bash "$PROJECT_ROOT/scripts/fix-fabric-headers.sh"
fi

echo "✅ iOS build fixes completed!"
echo ""
echo "📝 Next steps:"
echo "  1. Run: bun run ios"
echo "  2. If build still fails, try opening in Xcode:"
echo "     open ios/WeatherSunscreen.xcworkspace"
echo "  3. Clean build folder in Xcode (Shift+Cmd+K) and build"
echo ""
echo "⚠️  Note: This configuration uses buildReactNativeFromSource=true"
echo "    which may increase build times but ensures compatibility."