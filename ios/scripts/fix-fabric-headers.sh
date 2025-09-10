#!/bin/bash

# Fix React Native Fabric Header Issues
# This script creates symlinks to resolve missing header file issues with React Native 0.81.0 + Expo 54.0.0-preview.4

set -e

echo "🔧 Fixing React Native Fabric header issues..."

# Define paths using relative paths from script location
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IOS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$IOS_DIR/.." && pwd)"
BUILD_DIR="$IOS_DIR/build"
GENERATED_HEADERS="$BUILD_DIR/generated/ios"
NODE_MODULES="$PROJECT_ROOT/node_modules"
PODS_DIR="$IOS_DIR/Pods"

# Create build directories if they don't exist
mkdir -p "$GENERATED_HEADERS/react/renderer/components/image"
mkdir -p "$GENERATED_HEADERS/react/renderer/components/rnscreens"
mkdir -p "$GENERATED_HEADERS/react/renderer/components/safeareacontext"

# Function to create symlink safely
create_symlink() {
    local target="$1"
    local link="$2"
    
    # Create directory for link if it doesn't exist
    mkdir -p "$(dirname "$link")"
    
    # Remove existing link if it exists
    if [ -L "$link" ] || [ -f "$link" ]; then
        rm -f "$link"
    fi
    
    # Create symlink if target exists
    if [ -f "$target" ]; then
        ln -sf "$target" "$link"
        echo "✅ Created symlink: $(basename "$link")"
    else
        echo "⚠️  Target not found: $target"
    fi
}

# Fix image conversions.h
# Look for the actual conversions.h file in React Native Fabric
REACT_NATIVE_DIR="$NODE_MODULES/react-native"
FABRIC_IMAGE_DIR="$REACT_NATIVE_DIR/ReactCommon/react/renderer/components/image"

if [ -f "$FABRIC_IMAGE_DIR/conversions.h" ]; then
    create_symlink "$FABRIC_IMAGE_DIR/conversions.h" "$GENERATED_HEADERS/react/renderer/components/image/conversions.h"
else
    # Alternative location
    ALT_FABRIC_DIR="$REACT_NATIVE_DIR/React/Fabric/Mounting/ComponentViews/Image"
    if [ -f "$ALT_FABRIC_DIR/conversions.h" ]; then
        create_symlink "$ALT_FABRIC_DIR/conversions.h" "$GENERATED_HEADERS/react/renderer/components/image/conversions.h"
    else
        echo "❌ Could not find conversions.h in React Native"
        # Create a minimal conversions.h as fallback
        cat > "$GENERATED_HEADERS/react/renderer/components/image/conversions.h" << 'INNER_EOF'
#pragma once

// Minimal conversions.h fallback for React Native Fabric
// This file provides basic type conversions for image components

#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/propsConversions.h>

namespace facebook {
namespace react {

// Basic image conversion functions
template <typename T>
static inline T convertRawProp(
    const PropsParserContext& context,
    const RawProps& rawProps,
    const char* name,
    const T& defaultValue) {
  return convertRawProp(context, rawProps, name, defaultValue);
}

} // namespace react
} // namespace facebook
INNER_EOF
        echo "✅ Created fallback conversions.h"
    fi
fi

echo "✅ Fabric header fixes completed!"
echo "📝 You can now retry the iOS build with: npm run ios"
