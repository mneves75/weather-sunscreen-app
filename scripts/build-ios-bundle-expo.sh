#!/bin/bash

# iOS Bundle Build Script using Expo Export
# This is the official Expo way to create bundles for native Xcode builds
# Usage: ./scripts/build-ios-bundle-expo.sh

set -e

echo "🔨 Building iOS JavaScript bundle (Expo method)..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Clean old exports
echo -e "${YELLOW}Cleaning old exports...${NC}"
rm -rf ios/dist 2>/dev/null || true

# Step 2: Export using Expo (this bundles the JavaScript)
echo -e "${YELLOW}Exporting with Expo...${NC}"
npx expo export \
  --platform ios \
  --output-dir ios/dist \
  --dev false

# Step 3: Create symbolic link for Xcode compatibility
echo -e "${YELLOW}Setting up for Xcode...${NC}"
if [ -f "ios/dist/bundles/ios/main.jsbundle" ]; then
  cp ios/dist/bundles/ios/main.jsbundle ios/main.jsbundle
  echo -e "${GREEN}✓ Bundle copied to ios/main.jsbundle${NC}"
fi

# Step 4: Copy assets
if [ -d "ios/dist/assets" ]; then
  mkdir -p ios/main.jsbundle.assets
  cp -r ios/dist/assets/* ios/main.jsbundle.assets/ 2>/dev/null || true
  echo -e "${GREEN}✓ Assets copied${NC}"
fi

echo -e "${GREEN}✓ Bundle created successfully!${NC}"
echo -e "${BLUE}📁 Full export:${NC} ios/dist/"
echo -e "${BLUE}📁 Bundle:${NC} ios/main.jsbundle"
echo -e "${BLUE}📝 Size:${NC} $(du -h ios/main.jsbundle | cut -f1)"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Open ios/weathersunscreenapp.xcworkspace in Xcode"
echo "  2. Connect iPhone"
echo "  3. Select iPhone as build destination"
echo "  4. Press ⌘R to build and run"
