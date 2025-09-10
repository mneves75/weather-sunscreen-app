#!/bin/bash

# Fix for ReactNativeDependencies pod installation issue
# This script patches the problematic cp command in the preparation script

echo "🔧 Patching ReactNativeDependencies podspec..."

PODSPEC_PATH="../node_modules/react-native/third-party-podspecs/ReactNativeDependencies.podspec"

if [ -f "$PODSPEC_PATH" ]; then
    # Create backup
    cp "$PODSPEC_PATH" "$PODSPEC_PATH.backup"
    
    # Replace the problematic line that causes "File exists" error
    sed -i.tmp 's/cp -R "\$XCFRAMEWORK_PATH\/\.\." framework\/packages\/react-native\//rm -rf framework\/packages\/react-native\/* \&\& cp -R "\$XCFRAMEWORK_PATH\/\.\." framework\/packages\/react-native\//' "$PODSPEC_PATH"
    
    echo "✅ Patched ReactNativeDependencies podspec"
    echo "📁 Backup saved as: $PODSPEC_PATH.backup"
else
    echo "❌ ReactNativeDependencies podspec not found at: $PODSPEC_PATH"
    exit 1
fi