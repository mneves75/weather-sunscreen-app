#!/bin/bash

# iOS App Store Screenshot Generator
# For Weather Sunscreen App
# Generates screenshots for 6.7" display (iPhone 16 Pro Max)

set -e

SIMULATOR_NAME="iPhone 16 Pro Max"
SIMULATOR_ID="E13841AC-07D8-4647-A485-92D4ABA6DFFE"
SCREENSHOT_DIR="fastlane/screenshots/ios/en-US"
APP_SCHEME="weathersuncreenapp"

echo "==================================="
echo "iOS App Store Screenshot Generator"
echo "==================================="
echo ""

# Create screenshot directory
mkdir -p "$SCREENSHOT_DIR"

# Boot simulator
echo "1. Booting $SIMULATOR_NAME simulator..."
xcrun simctl boot "$SIMULATOR_ID" 2>/dev/null || echo "   Simulator already booted"
open -a Simulator

# Wait for simulator to be ready
echo "2. Waiting for simulator to be ready..."
sleep 5

# Build and install app
echo "3. Building and installing app..."
echo "   (This may take a few minutes)"
cd ios
xcodebuild -workspace weathersuncreenapp.xcworkspace \
  -scheme "$APP_SCHEME" \
  -configuration Release \
  -destination "id=$SIMULATOR_ID" \
  -derivedDataPath build \
  | grep -E "Build succeeded|error:" || true
cd ..

# Launch app
echo "4. Launching app..."
xcrun simctl launch "$SIMULATOR_ID" com.mneves.weather-suncreen-app

echo ""
echo "==================================="
echo "Screenshot Instructions"
echo "==================================="
echo ""
echo "The app is now running on $SIMULATOR_NAME"
echo ""
echo "Required screenshots for App Store (6.7\" display):"
echo "  1. Home/Dashboard screen (showing weather cards)"
echo "  2. UV Index screen (with liquid glass effects)"
echo "  3. Forecast screen (7-day weather forecast)"
echo "  4. Settings screen (theme/personalization options)"
echo ""
echo "To take screenshots:"
echo "  - Navigate to each screen in the app"
echo "  - Press Cmd+S in Simulator to save screenshot"
echo "  - Or use: xcrun simctl io booted screenshot <filename>.png"
echo ""
echo "Screenshots will be saved to Desktop by default"
echo "Move them to: $SCREENSHOT_DIR"
echo ""
echo "Recommended naming convention:"
echo "  - 01-home.png"
echo "  - 02-uv-index.png"
echo "  - 03-forecast.png"
echo "  - 04-settings.png"
echo ""
echo "App Store Requirements:"
echo "  - Minimum 3 screenshots, maximum 10"
echo "  - PNG or JPG format"
echo "  - 6.7\" display: 1290 x 2796 pixels"
echo ""
