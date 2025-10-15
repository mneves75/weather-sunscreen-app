#!/bin/bash

# iOS Bundle Build Script for Xcode
# Creates JavaScript bundle without Metro dev server
# Usage: ./scripts/build-ios-bundle.sh

set -e

echo "🔨 Building iOS JavaScript bundle..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Clean old bundle
echo -e "${YELLOW}Cleaning old bundle...${NC}"
rm -f ios/main.jsbundle
rm -rf ios/main.jsbundle.map

# Step 2: Build bundle using Metro (correct syntax)
echo -e "${YELLOW}Generating JavaScript bundle for iOS...${NC}"
npx metro build \
  node_modules/expo-router/entry.js \
  --platform ios \
  --dev false \
  --out ios/main.jsbundle \
  --reset-cache

# Step 3: Copy assets
echo -e "${YELLOW}Copying assets...${NC}"
# Assets are typically handled by Xcode, but we can verify
if [ -d "assets" ]; then
  mkdir -p ios/main.jsbundle.assets
  cp -r assets/* ios/main.jsbundle.assets/ 2>/dev/null || true
fi

echo -e "${GREEN}✓ Bundle created successfully!${NC}"
echo -e "${BLUE}📁 Bundle location:${NC} ios/main.jsbundle"
echo -e "${BLUE}📝 Size:${NC} $(du -h ios/main.jsbundle | cut -f1)"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Open ios/weathersunscreenapp.xcworkspace in Xcode"
echo "  2. Connect iPhone"
echo "  3. Select iPhone as build destination"
echo "  4. Press ⌘R to build and run"
