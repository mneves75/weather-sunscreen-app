# iOS 26 Liquid Glass Icon Setup

## Overview

This document explains how to create and configure an iOS 26 Liquid Glass icon for the Weather Sunscreen App using Apple's Icon Composer tool.

## Design Concept

The icon features:
- **Sun**: Positioned in the upper portion with glowing rays (representing UV index monitoring)
- **Shield with SPF 50+**: Positioned below the sun (representing sun protection)
- **Gradient background**: Sky blue transitioning to warm sunset tones
- **Glass effects**: Subtle reflections, highlights, and depth for the Liquid Glass aesthetic

## Prerequisites

### System Requirements
- **macOS 15 (Sequoia) or later**
- **Xcode 16.1+** with iOS 26 SDK
- **Icon Composer** (included with Xcode Command Line Tools)

### Check if Icon Composer is installed
```bash
which iconutil
# Should output: /usr/bin/iconutil
```

## File Structure

```
assets/images/
├── icon-liquid-glass-source.svg     # Source SVG (1024x1024)
├── icon-liquid-glass-1024.png       # Generated 1024x1024 PNG
├── icon-liquid-glass-180.png        # Generated 180x180 PNG
├── icon-liquid-glass-152.png        # Generated 152x152 PNG
└── AppIcon.appiconset/              # Generated .icon folder
    ├── Contents.json
    └── ... (various sizes)
```

## Step-by-Step Guide

### 1. Generate PNG Assets from SVG

First, generate PNG files from the SVG source:

```bash
# Navigate to project root
cd /Users/mvneves/dev/MOBILE/weather-suncreen-app

# Run the icon generation script
bun run generate-icons

# Or manually with ImageMagick (if installed)
magick assets/images/icon-liquid-glass-source.svg -resize 1024x1024 assets/images/icon-liquid-glass-1024.png
magick assets/images/icon-liquid-glass-source.svg -resize 180x180 assets/images/icon-liquid-glass-180.png
magick assets/images/icon-liquid-glass-source.svg -resize 152x152 assets/images/icon-liquid-glass-152.png
```

Alternatively, use an online SVG to PNG converter:
1. Go to https://svgtopng.com/
2. Upload `icon-liquid-glass-source.svg`
3. Export at 1024x1024, 180x180, and 152x152
4. Save to `assets/images/`

### 2. Create .appiconset Folder Structure

Create the required folder structure for Icon Composer:

```bash
mkdir -p assets/images/AppIcon.appiconset
```

### 3. Create Contents.json

Create `assets/images/AppIcon.appiconset/Contents.json`:

```json
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
```

### 4. Copy PNG to .appiconset

```bash
cp assets/images/icon-liquid-glass-1024.png assets/images/AppIcon.appiconset/icon-1024.png
```

### 5. Generate .icon File with Icon Composer

**Option A: Using Xcode Asset Catalog (Recommended)**

1. Open Xcode and your project
2. Navigate to `ios/weathersuncreenapp/Images.xcassets`
3. Select or create an AppIcon asset
4. In the Attributes Inspector, enable "Supports Liquid Glass"
5. Drag `icon-liquid-glass-1024.png` into the 1024x1024 slot
6. Xcode will automatically generate the .icon file on build

**Option B: Using iconutil CLI**

```bash
# Generate .icon file from .appiconset
iconutil -c icon -o assets/images/AppIcon.icon assets/images/AppIcon.appiconset

# Verify the .icon file was created
ls -lh assets/images/AppIcon.icon
```

**Option C: Using Icon Composer GUI (if available)**

1. Open Icon Composer from `/Applications/Utilities/Icon Composer.app`
2. Drag `icon-liquid-glass-1024.png` into the icon well
3. Enable "Liquid Glass Effect" in the settings
4. Export as `.icon` format
5. Save to `assets/images/AppIcon.icon`

### 6. Update app.json

Update your `app.json` to reference the new icon:

```json
{
  "expo": {
    "icon": "./assets/images/icon-liquid-glass-1024.png",
    "ios": {
      "icon": "./assets/images/AppIcon.icon"
    }
  }
}
```

### 7. Update iOS Native Project

If you have a native iOS project (CNG workflow):

```bash
# Copy .icon file to iOS project
cp assets/images/AppIcon.icon ios/weathersuncreenapp/Images.xcassets/AppIcon.appiconset/

# Update Info.plist if needed
# The icon should be automatically detected by the build system
```

### 8. Rebuild and Test

```bash
# Clean build folders
rm -rf ios/build
cd ios && pod install && cd ..

# Run development build
bun run ios

# Or create a production build
bun run ios:release
```

## Design Guidelines for Liquid Glass Icons

### Material Properties
- **Translucency**: Use gradients with subtle opacity changes (0.8-1.0)
- **Depth**: Layer elements with shadows and highlights
- **Reflections**: Add white overlays with radial/linear gradients at 20-40% opacity
- **Blur**: Apply Gaussian blur (2-8px) to background elements

### Color Palette
- **Primary**: #4A90E2 (Sky Blue)
- **Secondary**: #FFD60A (Apple Yellow)
- **Accent**: #30D158 (Apple Green)
- **Highlights**: #FFFFFF at 20-40% opacity
- **Shadows**: #000000 at 10-20% opacity

### Composition
- **Safe Zone**: Keep important elements within 90% of icon bounds
- **Corner Radius**: iOS automatically applies 225px radius on 1024x1024 icons
- **Centered**: Main subject should be centered or follow rule of thirds
- **Contrast**: Ensure 4.5:1 contrast ratio for text/symbols

### Effects to Include
1. **Inner Shadow**: Adds depth to shield and sun
2. **Outer Glow**: Creates luminosity around the sun
3. **Glass Reflection**: Diagonal gradient from top-left (white, 40% → 0%)
4. **Vignette**: Subtle radial gradient from center to edges (0% → 15% black)

## Validation

### Check Icon Quality
```bash
# Validate icon dimensions
identify assets/images/icon-liquid-glass-1024.png
# Should output: icon-liquid-glass-1024.png PNG 1024x1024 ...

# Check .icon file structure (if created)
iconutil -c iconset assets/images/AppIcon.icon -o temp-iconset
ls temp-iconset/
rm -rf temp-iconset
```

### Test on Device
1. Install development build on iOS 26 device
2. Check Home Screen for Liquid Glass effect
3. Verify icon appears correctly in Settings
4. Test in both Light and Dark mode

## Troubleshooting

### Icon doesn't show Liquid Glass effect
- Ensure device is running iOS 26+
- Verify "Supports Liquid Glass" is enabled in asset catalog
- Check that .icon file is properly formatted
- Rebuild the app with clean build folder

### Build fails with icon errors
- Verify .icon file is in correct location
- Check Contents.json formatting
- Ensure all referenced PNG files exist
- Validate PNG file sizes match what's declared

### Icon looks pixelated
- Use SVG source and regenerate PNGs at higher DPI
- Ensure 1024x1024 PNG is high quality (not compressed)
- Avoid upscaling smaller images

## References

- [Apple HIG - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [iOS 26 Liquid Glass Guidelines](https://developer.apple.com/documentation/uikit/uiimage/liquid-glass)
- [Expo Icon Configuration](https://docs.expo.dev/develop/user-interface/app-icons/)
- [iconutil Man Page](x-man-page://iconutil)

## Automation Script

See `scripts/generate-icons.sh` for automated icon generation workflow.

---

**Last Updated**: 2025-10-07
**iOS Version**: 26.0+
**Expo SDK**: 54.0.0
