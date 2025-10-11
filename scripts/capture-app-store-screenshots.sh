#!/bin/bash

# Interactive iOS App Store Screenshot Capture
# For Weather Sunscreen App

set -e

SIMULATOR_ID="E13841AC-07D8-4647-A485-92D4ABA6DFFE"
SCREENSHOT_DIR="fastlane/screenshots/ios/en-US"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================="
echo "iOS App Store Screenshot Capture"
echo -e "===================================${NC}\n"

# Verify simulator is running
if ! xcrun simctl list devices | grep "$SIMULATOR_ID" | grep -q "Booted"; then
  echo -e "${YELLOW}Error: iPhone 16 Pro Max simulator is not running${NC}"
  echo "Please run: EXPO_IOS_SIM_DEVICE=\"iPhone 16 Pro Max\" bun run ios"
  exit 1
fi

echo -e "${GREEN}Simulator is running!${NC}\n"

# Create screenshot directory
mkdir -p "$SCREENSHOT_DIR"

# Function to capture screenshot
capture_screenshot() {
  local filename=$1
  local description=$2

  echo -e "${BLUE}Screenshot: ${filename}${NC}"
  echo -e "${YELLOW}${description}${NC}"
  echo ""
  echo "Navigate to this screen in the simulator, then press ENTER to capture..."
  read -r

  xcrun simctl io "$SIMULATOR_ID" screenshot "${SCREENSHOT_DIR}/${filename}"
  echo -e "${GREEN}Captured: ${filename}${NC}\n"
  sleep 1
}

# Main screenshot capture flow
echo -e "${BLUE}We will capture 4-6 screenshots for the App Store.${NC}"
echo "The app should already be running on iPhone 16 Pro Max simulator."
echo ""
echo "Press ENTER to begin..."
read -r
echo ""

# Screenshot 1: Home/Dashboard
capture_screenshot "01-home-dashboard.png" \
  "SCREEN 1: Home/Dashboard
  - Show weather cards with liquid glass effects
  - Current weather and UV index visible
  - Location indicator at top
  - Make sure data is loaded (not loading state)"

# Screenshot 2: UV Index Detail
capture_screenshot "02-uv-index.png" \
  "SCREEN 2: UV Index Detail
  - Navigate to UV Index screen (tap UV card or tab)
  - Show UV index gauge/visualization
  - Sunscreen recommendations visible
  - Liquid glass card design showcased"

# Screenshot 3: 7-Day Forecast
capture_screenshot "03-forecast.png" \
  "SCREEN 3: 7-Day Forecast
  - Navigate to Forecast tab/screen
  - Show week-long weather forecast
  - Temperature trends visible
  - Multiple forecast items displayed"

# Screenshot 4: Settings/Styles
capture_screenshot "04-settings.png" \
  "SCREEN 4: Settings/Personalization
  - Navigate to Settings/Styles tab
  - Show theme toggle options
  - Display personalization features
  - Material 3 design elements visible"

# Optional screenshots
echo ""
echo -e "${BLUE}Do you want to capture additional screenshots? (y/n)${NC}"
read -r response

if [[ "$response" == "y" || "$response" == "Y" ]]; then

  capture_screenshot "05-weather-details.png" \
    "SCREEN 5: Weather Details (Optional)
    - Show detailed weather metrics
    - Humidity, wind, pressure, etc.
    - Beautiful data visualization"

  echo -e "${BLUE}Capture notifications screen? (y/n)${NC}"
  read -r notif_response

  if [[ "$notif_response" == "y" || "$notif_response" == "Y" ]]; then
    capture_screenshot "06-notifications.png" \
      "SCREEN 6: Notifications (Optional)
      - Show notification settings or examples
      - Smart notification features
      - Personalization options"
  fi
fi

# Summary
echo ""
echo -e "${GREEN}==================================="
echo "Screenshot Capture Complete!"
echo -e "===================================${NC}\n"

echo "Screenshots saved to: ${SCREENSHOT_DIR}"
echo ""

# Verify screenshots
echo "Captured screenshots:"
ls -lh "${SCREENSHOT_DIR}"/*.png 2>/dev/null

# Check resolution
echo ""
echo "Verifying screenshot resolution..."
for img in "${SCREENSHOT_DIR}"/*.png; do
  if [[ -f "$img" ]]; then
    size=$(sips -g pixelWidth -g pixelHeight "$img" | tail -2 | awk '{print $2}' | tr '\n' 'x' | sed 's/x$//')
    filename=$(basename "$img")

    if [[ "$size" == "1290x2796" ]]; then
      echo -e "${GREEN}✓${NC} $filename - ${size} (correct)"
    else
      echo -e "${YELLOW}⚠${NC} $filename - ${size} (expected 1290x2796)"
    fi
  fi
done

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review screenshots in: ${SCREENSHOT_DIR}"
echo "2. Verify image quality and content"
echo "3. Optional: Add device frames using Shotbot or Screenshot.rocks"
echo "4. Upload to App Store Connect"
echo ""
echo -e "${GREEN}See docs/APP_STORE_SCREENSHOTS.md for detailed guidance${NC}"
