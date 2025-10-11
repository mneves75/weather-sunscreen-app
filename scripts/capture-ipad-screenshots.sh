#!/bin/bash

# Interactive iPad App Store Screenshot Capture
# For Weather Sunscreen App - iPad Pro 13-inch

set -e

# iPad Pro 13-inch (M4) simulator
SIMULATOR_ID="49B69A76-7F74-40DE-8AA2-9E3AC87F6413"
SCREENSHOT_DIR="fastlane/screenshots/ios-ipad/en-US"

# App Store Connect required dimensions (iPad Pro 13-inch)
# Portrait: 2064 × 2752 pixels
# Landscape: 2752 × 2064 pixels
TARGET_WIDTH=2064
TARGET_HEIGHT=2752

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================="
echo "iPad App Store Screenshot Capture"
echo "iPad Pro 13-inch (M4)"
echo -e "===================================${NC}\n"

# Verify simulator is running
if ! xcrun simctl list devices | grep "$SIMULATOR_ID" | grep -q "Booted"; then
  echo -e "${YELLOW}iPad Pro 13-inch simulator is not running${NC}"
  echo "Booting simulator..."
  xcrun simctl boot "$SIMULATOR_ID" 2>/dev/null || echo "Already booted"
  open -a Simulator
  echo "Waiting for simulator to be ready..."
  sleep 10
fi

echo -e "${GREEN}Simulator is running!${NC}\n"

# Create screenshot directory
mkdir -p "$SCREENSHOT_DIR"

# Function to capture and resize screenshot
capture_screenshot() {
  local filename=$1
  local description=$2
  local filepath="${SCREENSHOT_DIR}/${filename}"

  echo -e "${BLUE}Screenshot: ${filename}${NC}"
  echo -e "${YELLOW}${description}${NC}"
  echo ""
  echo "Navigate to this screen in the simulator, then press ENTER to capture..."
  read -r

  # Capture screenshot
  xcrun simctl io "$SIMULATOR_ID" screenshot "$filepath"

  # Resize to App Store requirements (iPad Pro 13" portrait)
  sips -z "$TARGET_HEIGHT" "$TARGET_WIDTH" "$filepath" --out "$filepath" > /dev/null

  # Verify dimensions
  width=$(sips -g pixelWidth "$filepath" | tail -1 | awk '{print $2}')
  height=$(sips -g pixelHeight "$filepath" | tail -1 | awk '{print $2}')

  echo -e "${GREEN}✓ Captured and resized: ${filename} (${width}x${height})${NC}\n"
  sleep 1
}

# Main screenshot capture flow
echo -e "${BLUE}We will capture 4-6 screenshots for the App Store (iPad).${NC}"
echo "Make sure the app is running on iPad Pro 13-inch simulator."
echo ""
echo "Press ENTER to begin..."
read -r
echo ""

# Screenshot 1: Home/Dashboard
capture_screenshot "01-home-dashboard-ipad.png" \
  "SCREEN 1: Home/Dashboard (iPad)
  - Show weather cards optimized for iPad layout
  - Current weather and UV index visible
  - Take advantage of larger screen real estate
  - Liquid glass effects showcased"

# Screenshot 2: UV Index Detail
capture_screenshot "02-uv-index-ipad.png" \
  "SCREEN 2: UV Index Detail (iPad)
  - Navigate to UV Index screen
  - Show UV index gauge/visualization
  - Sunscreen recommendations visible
  - iPad-optimized layout"

# Screenshot 3: 7-Day Forecast
capture_screenshot "03-forecast-ipad.png" \
  "SCREEN 3: 7-Day Forecast (iPad)
  - Navigate to Forecast tab/screen
  - Show week-long weather forecast
  - iPad layout with more details visible
  - Temperature trends and graphs"

# Screenshot 4: Settings/Styles
capture_screenshot "04-settings-ipad.png" \
  "SCREEN 4: Settings/Personalization (iPad)
  - Navigate to Settings/Styles tab
  - Show theme toggle options
  - Display personalization features
  - iPad-optimized settings layout"

# Optional screenshots
echo ""
echo -e "${BLUE}Do you want to capture additional screenshots? (y/n)${NC}"
read -r response

if [[ "$response" == "y" || "$response" == "Y" ]]; then

  capture_screenshot "05-weather-details-ipad.png" \
    "SCREEN 5: Weather Details (Optional - iPad)
    - Show detailed weather metrics
    - Humidity, wind, pressure, etc.
    - Beautiful data visualization on iPad"

  echo -e "${BLUE}Capture notifications screen? (y/n)${NC}"
  read -r notif_response

  if [[ "$notif_response" == "y" || "$notif_response" == "Y" ]]; then
    capture_screenshot "06-notifications-ipad.png" \
      "SCREEN 6: Notifications (Optional - iPad)
      - Show notification settings or examples
      - Smart notification features
      - iPad layout"
  fi
fi

# Summary
echo ""
echo -e "${GREEN}==================================="
echo "iPad Screenshot Capture Complete!"
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
    width=$(sips -g pixelWidth "$img" | tail -1 | awk '{print $2}')
    height=$(sips -g pixelHeight "$img" | tail -1 | awk '{print $2}')
    filename=$(basename "$img")

    if [ "$width" -eq "$TARGET_WIDTH" ] && [ "$height" -eq "$TARGET_HEIGHT" ]; then
      echo -e "${GREEN}✓${NC} $filename - ${width}x${height} (correct)"
    else
      echo -e "${YELLOW}⚠${NC} $filename - ${width}x${height} (expected ${TARGET_WIDTH}x${TARGET_HEIGHT})"
    fi
  fi
done

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review screenshots in: ${SCREENSHOT_DIR}"
echo "2. Verify image quality and iPad layout optimization"
echo "3. Optional: Add device frames using Shotbot or Screenshot.rocks"
echo "4. Upload to App Store Connect (iPad Pro 13-inch section)"
echo ""
echo -e "${GREEN}See docs/APP_STORE_SCREENSHOTS.md for detailed guidance${NC}"
