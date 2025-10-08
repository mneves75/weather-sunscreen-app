#!/bin/bash

#
# Icon Generation Script for iOS 26 Liquid Glass Icons
# Generates PNG assets from SVG source for use with Icon Composer
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SVG_SOURCE="$PROJECT_ROOT/assets/images/icon-liquid-glass-source.svg"
OUTPUT_DIR="$PROJECT_ROOT/assets/images"
APPICONSET_DIR="$OUTPUT_DIR/AppIcon.appiconset"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}     iOS 26 Liquid Glass Icon Generator${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check if SVG source exists
if [ ! -f "$SVG_SOURCE" ]; then
    echo -e "${RED}✗ Error: SVG source not found at $SVG_SOURCE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found SVG source${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate PNG with ImageMagick
generate_with_imagemagick() {
    local size=$1
    local output=$2

    echo -e "${BLUE}  → Generating ${size}x${size} with ImageMagick...${NC}"
    magick "$SVG_SOURCE" -resize "${size}x${size}" -background none "$output"

    if [ -f "$output" ]; then
        echo -e "${GREEN}    ✓ Created: $output${NC}"
        return 0
    else
        echo -e "${RED}    ✗ Failed to create: $output${NC}"
        return 1
    fi
}

# Function to generate PNG with Inkscape
generate_with_inkscape() {
    local size=$1
    local output=$2

    echo -e "${BLUE}  → Generating ${size}x${size} with Inkscape...${NC}"
    inkscape "$SVG_SOURCE" --export-filename="$output" --export-width="$size" --export-height="$size"

    if [ -f "$output" ]; then
        echo -e "${GREEN}    ✓ Created: $output${NC}"
        return 0
    else
        echo -e "${RED}    ✗ Failed to create: $output${NC}"
        return 1
    fi
}

# Function to generate PNG with rsvg-convert (librsvg)
generate_with_rsvg() {
    local size=$1
    local output=$2

    echo -e "${BLUE}  → Generating ${size}x${size} with rsvg-convert...${NC}"
    rsvg-convert "$SVG_SOURCE" -w "$size" -h "$size" -o "$output"

    if [ -f "$output" ]; then
        echo -e "${GREEN}    ✓ Created: $output${NC}"
        return 0
    else
        echo -e "${RED}    ✗ Failed to create: $output${NC}"
        return 1
    fi
}

# Detect available tools
TOOL=""
if command_exists magick; then
    TOOL="imagemagick"
    echo -e "${GREEN}✓ Detected: ImageMagick (magick)${NC}"
elif command_exists convert; then
    TOOL="imagemagick-legacy"
    echo -e "${GREEN}✓ Detected: ImageMagick (convert)${NC}"
elif command_exists inkscape; then
    TOOL="inkscape"
    echo -e "${GREEN}✓ Detected: Inkscape${NC}"
elif command_exists rsvg-convert; then
    TOOL="rsvg"
    echo -e "${GREEN}✓ Detected: librsvg (rsvg-convert)${NC}"
else
    echo -e "${RED}✗ No SVG converter found!${NC}"
    echo ""
    echo -e "${YELLOW}Please install one of the following:${NC}"
    echo ""
    echo -e "  ${BLUE}ImageMagick:${NC}"
    echo -e "    brew install imagemagick"
    echo ""
    echo -e "  ${BLUE}Inkscape:${NC}"
    echo -e "    brew install inkscape"
    echo ""
    echo -e "  ${BLUE}librsvg:${NC}"
    echo -e "    brew install librsvg"
    echo ""
    echo -e "${YELLOW}Or use an online converter:${NC}"
    echo -e "  1. Go to https://svgtopng.com/"
    echo -e "  2. Upload: $SVG_SOURCE"
    echo -e "  3. Export sizes: 1024x1024, 180x180, 152x152, 120x120, 87x87, 80x80, 58x58, 40x40"
    echo -e "  4. Save to: $OUTPUT_DIR"
    echo ""
    exit 1
fi

echo ""

# Array of sizes to generate
declare -a SIZES=(1024 180 152 120 87 80 58 40)

# Generate PNGs
echo -e "${BLUE}Generating PNG assets...${NC}"
echo ""

for size in "${SIZES[@]}"; do
    output="$OUTPUT_DIR/icon-liquid-glass-$size.png"

    case $TOOL in
        imagemagick)
            generate_with_imagemagick "$size" "$output"
            ;;
        imagemagick-legacy)
            echo -e "${BLUE}  → Generating ${size}x${size} with ImageMagick (legacy)...${NC}"
            convert "$SVG_SOURCE" -resize "${size}x${size}" -background none "$output"
            echo -e "${GREEN}    ✓ Created: $output${NC}"
            ;;
        inkscape)
            generate_with_inkscape "$size" "$output"
            ;;
        rsvg)
            generate_with_rsvg "$size" "$output"
            ;;
    esac
done

echo ""
echo -e "${GREEN}✓ PNG generation complete!${NC}"
echo ""

# Create .appiconset folder structure
echo -e "${BLUE}Creating .appiconset folder structure...${NC}"
mkdir -p "$APPICONSET_DIR"

# Create Contents.json
cat > "$APPICONSET_DIR/Contents.json" <<EOF
{
  "images": [
    {
      "filename": "icon-1024.png",
      "idiom": "universal",
      "platform": "ios",
      "size": "1024x1024"
    }
  ],
  "info": {
    "author": "xcode",
    "version": 1
  },
  "properties": {
    "supports-liquid-glass": true
  }
}
EOF

echo -e "${GREEN}✓ Created Contents.json${NC}"

# Copy 1024x1024 icon
cp "$OUTPUT_DIR/icon-liquid-glass-1024.png" "$APPICONSET_DIR/icon-1024.png"
echo -e "${GREEN}✓ Copied icon to .appiconset${NC}"

echo ""

# Try to generate .icon file if iconutil is available
if command_exists iconutil; then
    echo -e "${BLUE}Attempting to generate .icon file with iconutil...${NC}"

    ICON_OUTPUT="$OUTPUT_DIR/AppIcon.icon"

    # iconutil requires specific folder structure, so we skip this for now
    # The .icon file should be generated by Xcode during build
    echo -e "${YELLOW}⚠ Note: .icon generation requires Xcode Asset Catalog compilation${NC}"
    echo -e "${YELLOW}  The .icon file will be generated when you build the iOS app${NC}"
else
    echo -e "${YELLOW}⚠ iconutil not found (requires Xcode Command Line Tools)${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Icon generation complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Generated files:${NC}"
ls -lh "$OUTPUT_DIR"/icon-liquid-glass-*.png | awk '{print "  " $9 " (" $5 ")"}'
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Review generated icons in: $OUTPUT_DIR"
echo -e "  2. Follow instructions in: docs/LIQUID_GLASS_ICON_SETUP.md"
echo -e "  3. Build iOS app to generate .icon file"
echo -e "  4. Test on iOS 26+ device/simulator"
echo ""
