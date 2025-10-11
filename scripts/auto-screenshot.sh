#!/bin/bash

# Automated iOS Screenshot Capture
# Captures screenshots from running app using simctl

set -e

SIMULATOR_ID="E13841AC-07D8-4647-A485-92D4ABA6DFFE"
SCREENSHOT_DIR="fastlane/screenshots/ios/en-US"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create screenshot directory
mkdir -p "$SCREENSHOT_DIR"

echo "==================================="
echo "iOS Screenshot Capture Tool"
echo "==================================="
echo ""
echo "This script will capture screenshots from the running app."
echo "Make sure the app is running and navigate to each screen when prompted."
echo ""

# Function to take screenshot
take_screenshot() {
  local name=$1
  local filename="${SCREENSHOT_DIR}/${name}.png"

  echo "Navigate to: $name"
  echo "Press ENTER when ready to capture..."
  read -r

  xcrun simctl io "$SIMULATOR_ID" screenshot "$filename"
  echo "Saved: $filename"
  echo ""
}

# Check if simulator is booted
if ! xcrun simctl list devices | grep "$SIMULATOR_ID" | grep -q "Booted"; then
  echo "Error: Simulator is not booted"
  echo "Run ./scripts/take-screenshots.sh first to boot simulator and launch app"
  exit 1
fi

echo "Ready to capture screenshots!"
echo ""

# Capture screenshots for each required screen
take_screenshot "01-home-dashboard"
take_screenshot "02-uv-index"
take_screenshot "03-forecast"
take_screenshot "04-settings"

# Optional additional screenshots
echo "Capture additional screenshots? (y/n)"
read -r response
if [[ "$response" == "y" ]]; then
  take_screenshot "05-weather-details"
  take_screenshot "06-notifications"
fi

echo "==================================="
echo "Screenshot Capture Complete!"
echo "==================================="
echo ""
echo "Screenshots saved to: $SCREENSHOT_DIR"
echo ""
echo "Next steps:"
echo "  1. Review screenshots in $SCREENSHOT_DIR"
echo "  2. Edit/enhance if needed (add device frames, backgrounds)"
echo "  3. Upload to App Store Connect"
echo ""
echo "Screenshot specifications:"
echo "  - Resolution: 1290 x 2796 pixels (6.7\" display)"
echo "  - Format: PNG or JPG"
echo "  - File size: < 500 KB recommended"
echo ""

# List captured screenshots
echo "Captured screenshots:"
ls -lh "$SCREENSHOT_DIR"/*.png 2>/dev/null || echo "No screenshots found"
