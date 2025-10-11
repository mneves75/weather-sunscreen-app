#!/bin/bash

# Quick iOS Screenshot Setup
# Uses existing development build workflow

set -e

SIMULATOR_NAME="iPhone 16 Pro Max"
SCREENSHOT_DIR="fastlane/screenshots/ios/en-US"

echo "==================================="
echo "iOS App Store Screenshot Setup"
echo "==================================="
echo ""

# Create screenshot directory
mkdir -p "$SCREENSHOT_DIR"

echo "Step 1: Starting the app..."
echo "This will launch the app on $SIMULATOR_NAME"
echo ""
echo "Run the following command in a separate terminal:"
echo ""
echo "  bun run ios -- --simulator \"$SIMULATOR_NAME\""
echo ""
echo "OR just run: bun run ios (will auto-select simulator)"
echo ""
echo "==================================="
echo "After the app launches, use the automated screenshot tool:"
echo ""
echo "  ./scripts/auto-screenshot.sh"
echo ""
echo "OR take manual screenshots:"
echo ""
echo "  1. Navigate to each screen in the app"
echo "  2. Press Cmd+S in Simulator"
echo "  3. Screenshots save to Desktop"
echo "  4. Move to: $SCREENSHOT_DIR"
echo ""
echo "Required screenshots:"
echo "  - Home/Dashboard (weather cards with liquid glass)"
echo "  - UV Index screen"
echo "  - 7-day Forecast"
echo "  - Settings/Styles screen"
echo ""
echo "App Store specs (6.7\" display):"
echo "  - Resolution: 1290 x 2796 pixels"
echo "  - Format: PNG or JPG"
echo "  - 3-10 screenshots required"
echo ""
