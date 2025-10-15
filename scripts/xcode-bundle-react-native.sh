#!/bin/bash
#
# Xcode Build Phase Script: Bundle React Native for Production
#
# This script is called during Xcode build to generate the JavaScript bundle
# if it doesn't already exist. Place this in your Xcode build phases.
#
# Add as a "New Run Script Phase" in Xcode:
# 1. Target → Build Phases
# 2. Click "+" → New Run Script Phase
# 3. Paste this script path: ${SRCROOT}/../scripts/xcode-bundle-react-native.sh
#

set -e

PROJECT_DIR="${SRCROOT}/.."
BUNDLE_OUTPUT_PATH="${PROJECT_DIR}/ios/main.jsbundle"

# Only bundle if jsbundle doesn't exist (for development)
# In CI/CD, the bundle should already be created before running Xcode
if [ ! -f "$BUNDLE_OUTPUT_PATH" ]; then
  echo "📦 Generating JavaScript bundle for Xcode build..."

  cd "$PROJECT_DIR"

  npx metro bundle \
    --platform ios \
    --dev false \
    --entry-file node_modules/expo-router/entry.js \
    --bundle-output "$BUNDLE_OUTPUT_PATH" \
    --assets-dest "$PROJECT_DIR/ios" \
    --reset-cache

  echo "✓ Bundle generated successfully"
else
  echo "✓ Using existing JavaScript bundle"
fi
