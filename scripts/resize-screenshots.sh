#!/bin/bash

# Resize iOS Screenshots to App Store Connect Requirements
# Automatically resizes simulator screenshots to correct dimensions

set -e

SCREENSHOT_DIR="fastlane/screenshots/ios/en-US"

# App Store Connect accepted dimensions
# iPhone 16 Pro Max, 15 Pro Max, 14 Pro Max (6.7" display)
TARGET_WIDTH=1284
TARGET_HEIGHT=2778

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================="
echo "iOS Screenshot Resizer"
echo "Target: ${TARGET_WIDTH}x${TARGET_HEIGHT}"
echo -e "===================================${NC}\n"

if [ ! -d "$SCREENSHOT_DIR" ]; then
  echo -e "${RED}Error: Screenshot directory not found: $SCREENSHOT_DIR${NC}"
  exit 1
fi

# Find all PNG files
screenshots=$(find "$SCREENSHOT_DIR" -name "*.png" -type f)

if [ -z "$screenshots" ]; then
  echo -e "${YELLOW}No screenshots found in $SCREENSHOT_DIR${NC}"
  exit 0
fi

echo "Processing screenshots..."
echo ""

resized_count=0
skipped_count=0

while IFS= read -r screenshot; do
  filename=$(basename "$screenshot")

  # Get current dimensions
  width=$(sips -g pixelWidth "$screenshot" | tail -1 | awk '{print $2}')
  height=$(sips -g pixelHeight "$screenshot" | tail -1 | awk '{print $2}')

  if [ "$width" -eq "$TARGET_WIDTH" ] && [ "$height" -eq "$TARGET_HEIGHT" ]; then
    echo -e "${GREEN}✓${NC} $filename - Already ${width}x${height}"
    ((skipped_count++))
  else
    echo -e "${YELLOW}→${NC} $filename - Resizing from ${width}x${height} to ${TARGET_WIDTH}x${TARGET_HEIGHT}"

    # Resize in place
    sips -z "$TARGET_HEIGHT" "$TARGET_WIDTH" "$screenshot" --out "$screenshot" > /dev/null

    # Verify resize
    new_width=$(sips -g pixelWidth "$screenshot" | tail -1 | awk '{print $2}')
    new_height=$(sips -g pixelHeight "$screenshot" | tail -1 | awk '{print $2}')

    if [ "$new_width" -eq "$TARGET_WIDTH" ] && [ "$new_height" -eq "$TARGET_HEIGHT" ]; then
      echo -e "${GREEN}✓${NC} $filename - Resized successfully"
      ((resized_count++))
    else
      echo -e "${RED}✗${NC} $filename - Resize failed (got ${new_width}x${new_height})"
    fi
  fi
done <<< "$screenshots"

echo ""
echo -e "${GREEN}==================================="
echo "Resize Complete!"
echo -e "===================================${NC}"
echo "Resized: $resized_count"
echo "Skipped (already correct): $skipped_count"
echo ""
echo "All screenshots are now ${TARGET_WIDTH}x${TARGET_HEIGHT} (iPhone 16 Pro Max standard)"
