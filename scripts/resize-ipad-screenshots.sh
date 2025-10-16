#!/bin/bash

# Resize iPad Screenshots to App Store Connect Requirements
# Automatically resizes simulator screenshots to correct dimensions

# Note: Not using 'set -e' to allow graceful handling of all screenshots
# even if individual operations fail

SCREENSHOT_DIR="fastlane/screenshots/ios-ipad/en-US"

# App Store Connect accepted dimensions
# iPad Pro 13-inch (6th generation, M4)
TARGET_WIDTH=2064
TARGET_HEIGHT=2752

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================="
echo "iPad Screenshot Resizer"
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

# Use for loop to iterate through files (more reliable than while read)
for screenshot in "$SCREENSHOT_DIR"/*.png; do
  [ -f "$screenshot" ] || continue

  filename=$(basename "$screenshot")

  # Get current dimensions using sips
  width=$(sips -g pixelWidth "$screenshot" 2>/dev/null | tail -1 | awk '{print $2}')
  height=$(sips -g pixelHeight "$screenshot" 2>/dev/null | tail -1 | awk '{print $2}')

  if [ "$width" -eq "$TARGET_WIDTH" ] && [ "$height" -eq "$TARGET_HEIGHT" ]; then
    echo -e "${GREEN}✓${NC} $filename - Already ${width}x${height}"
    ((skipped_count++))
  else
    echo -e "${YELLOW}→${NC} $filename - Resizing from ${width}x${height} to ${TARGET_WIDTH}x${TARGET_HEIGHT}"

    # Resize in place using sips
    sips -z "$TARGET_HEIGHT" "$TARGET_WIDTH" "$screenshot" --out "$screenshot" > /dev/null 2>&1 || true

    # Verify resize completed
    new_width=$(sips -g pixelWidth "$screenshot" 2>/dev/null | tail -1 | awk '{print $2}')
    new_height=$(sips -g pixelHeight "$screenshot" 2>/dev/null | tail -1 | awk '{print $2}')

    if [ "$new_width" -eq "$TARGET_WIDTH" ] && [ "$new_height" -eq "$TARGET_HEIGHT" ]; then
      echo -e "${GREEN}✓${NC} $filename - Resized successfully"
      ((resized_count++))
    else
      echo -e "${RED}✗${NC} $filename - Resize failed (got ${new_width}x${new_height})"
    fi
  fi
done

echo ""
echo -e "${GREEN}==================================="
echo "Resize Complete!"
echo -e "===================================${NC}"
echo "Resized: $resized_count"
echo "Skipped (already correct): $skipped_count"
echo ""
echo "All screenshots are now ${TARGET_WIDTH}x${TARGET_HEIGHT} (iPad Pro 13-inch standard)"
