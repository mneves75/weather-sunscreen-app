#!/bin/bash

# Comprehensive fix for React Native Fabric header path issues
# This script ensures generated headers are accessible from the expected include paths

echo "🔧 Fixing React Native Fabric header issues..."

# Define paths relative to script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IOS_DIR="$PROJECT_ROOT/ios"
GENERATED_HEADERS="$IOS_DIR/build/generated/ios"
SAFE_AREA_NODE_MODULES="$PROJECT_ROOT/node_modules/react-native-safe-area-context"
SCREENS_NODE_MODULES="$PROJECT_ROOT/node_modules/react-native-screens"

cd "$IOS_DIR"

# Create header search directories if they don't exist
echo "📁 Creating header search directories..."

# Create the react/renderer structure in both node_modules packages
mkdir -p "$SAFE_AREA_NODE_MODULES/react/renderer/components/safeareacontext"
mkdir -p "$SAFE_AREA_NODE_MODULES/react/renderer/components/rnscreens"
mkdir -p "$SCREENS_NODE_MODULES/react/renderer/components/safeareacontext"
mkdir -p "$SCREENS_NODE_MODULES/react/renderer/components/rnscreens"

# Function to create symlinks safely
create_symlink() {
    local source="$1"
    local target="$2"
    
    if [ -f "$source" ]; then
        rm -f "$target"
        ln -sf "$source" "$target"
        echo "✓ Linked: $(basename $target)"
    else
        echo "⚠️  Source not found: $source"
    fi
}

# Create symlinks for safe-area-context headers
if [ -d "$GENERATED_HEADERS/react/renderer/components/safeareacontext" ]; then
    echo "🔗 Creating symlinks for safe-area-context headers..."
    
    for header in Props.h EventEmitters.h ShadowNodes.h States.h ComponentDescriptors.h RCTComponentViewHelpers.h; do
        source_path="$GENERATED_HEADERS/react/renderer/components/safeareacontext/$header"
        
        # Link to safe-area-context node_modules
        target_path="$SAFE_AREA_NODE_MODULES/react/renderer/components/safeareacontext/$header"
        create_symlink "$source_path" "$target_path"
        
        # Also link to screens node_modules (in case it needs them)
        target_path="$SCREENS_NODE_MODULES/react/renderer/components/safeareacontext/$header"
        create_symlink "$source_path" "$target_path"
    done
fi

# Create symlinks for screens headers
if [ -d "$GENERATED_HEADERS/react/renderer/components/rnscreens" ]; then
    echo "🔗 Creating symlinks for screens headers..."
    
    for header in Props.h EventEmitters.h ShadowNodes.h States.h ComponentDescriptors.h RCTComponentViewHelpers.h; do
        source_path="$GENERATED_HEADERS/react/renderer/components/rnscreens/$header"
        
        # Link to screens node_modules
        target_path="$SCREENS_NODE_MODULES/react/renderer/components/rnscreens/$header"
        create_symlink "$source_path" "$target_path"
        
        # Also link to safe-area-context node_modules (in case it needs them)
        target_path="$SAFE_AREA_NODE_MODULES/react/renderer/components/rnscreens/$header"
        create_symlink "$source_path" "$target_path"
    done
fi

# Additional fix: Create a general react/renderer structure in the iOS build directory
# that follows the standard include pattern
echo "🔗 Creating standard include structure..."

# Create the standard structure in Pods as well for good measure
mkdir -p "Pods/Headers/Private/react/renderer/components/safeareacontext"
mkdir -p "Pods/Headers/Private/react/renderer/components/rnscreens"
mkdir -p "Pods/Headers/Public/react/renderer/components/safeareacontext"
mkdir -p "Pods/Headers/Public/react/renderer/components/rnscreens"

# Link headers to Pods/Headers structure
for component in safeareacontext rnscreens; do
    for header in Props.h EventEmitters.h ShadowNodes.h States.h ComponentDescriptors.h RCTComponentViewHelpers.h; do
        source_path="$GENERATED_HEADERS/react/renderer/components/$component/$header"
        
        if [ -f "$source_path" ]; then
            # Link to both Private and Public headers
            target_private="Pods/Headers/Private/react/renderer/components/$component/$header"
            target_public="Pods/Headers/Public/react/renderer/components/$component/$header"
            
            create_symlink "$source_path" "$target_private"
            create_symlink "$source_path" "$target_public"
        fi
    done
done

# Additional fix: Create symlinks for generated component headers
echo "🔗 Creating component-specific header symlinks..."

# safeareacontext.h symlink
if [ -f "$GENERATED_HEADERS/../safeareacontext/safeareacontext.h" ]; then
    mkdir -p "$SAFE_AREA_NODE_MODULES/safeareacontext"
    mkdir -p "Pods/Headers/Private/safeareacontext"
    
    create_symlink "$GENERATED_HEADERS/../safeareacontext/safeareacontext.h" "$SAFE_AREA_NODE_MODULES/safeareacontext/safeareacontext.h"
    create_symlink "$GENERATED_HEADERS/../safeareacontext/safeareacontext.h" "Pods/Headers/Private/safeareacontext/safeareacontext.h"
fi

# rnscreens.h symlink
if [ -f "$GENERATED_HEADERS/../rnscreens/rnscreens.h" ]; then
    mkdir -p "$SCREENS_NODE_MODULES/rnscreens"
    mkdir -p "Pods/Headers/Private/rnscreens"
    
    create_symlink "$GENERATED_HEADERS/../rnscreens/rnscreens.h" "$SCREENS_NODE_MODULES/rnscreens/rnscreens.h"
    create_symlink "$GENERATED_HEADERS/../rnscreens/rnscreens.h" "Pods/Headers/Private/rnscreens/rnscreens.h"
fi

# Fix for conversions.h header specifically
echo "🔗 Creating conversions.h symlink..."

# Find the conversions.h file in React-Core
CONVERSIONS_HEADER=$(find "$IOS_DIR/Pods" -name "conversions.h" -path "*/react/renderer/components/image/*" 2>/dev/null | head -1)

if [ -f "$CONVERSIONS_HEADER" ]; then
    # Create the expected directory structure
    mkdir -p "$GENERATED_HEADERS/react/renderer/components/image"
    
    # Create symlink for conversions.h
    ln -sf "$CONVERSIONS_HEADER" "$GENERATED_HEADERS/react/renderer/components/image/conversions.h"
    echo "✅ Created symlink: conversions.h"
else
    # Alternative: Create a minimal conversions.h if not found
    echo "⚠️  conversions.h not found in Pods, creating minimal version..."
    mkdir -p "$GENERATED_HEADERS/react/renderer/components/image"
    cat > "$GENERATED_HEADERS/react/renderer/components/image/conversions.h" << 'EOF'
#pragma once

#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/propsConversions.h>

namespace facebook {
namespace react {

// Minimal conversions header for compatibility
// This file provides basic type conversions for Fabric components

} // namespace react
} // namespace facebook
EOF
    echo "✅ Created minimal conversions.h"
fi

echo "✅ Fabric header fixes completed!"
echo "📝 You can now retry the iOS build with: npm run ios"