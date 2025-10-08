# Google Play Store Screenshots Guide

## Required Screenshots

### Phone Screenshots (Required)
- **Phone**: At least 2 screenshots
- **Recommended**: 8 screenshots max (app chooses best for display)

### Tablet Screenshots (Required if app supports tablets)
- **7-inch tablet**: 1200 x 1920 pixels minimum
- **10-inch tablet**: 1800 x 2880 pixels minimum

## Screenshot Specifications

### Phone Screenshots
- **Format**: PNG or JPEG
- **Minimum size**: 320 pixels width
- **Maximum size**: 3840 x 2160 pixels (4K)
- **Recommended**: 1080 x 1920 pixels or 1440 x 2560 pixels

### Tablet Screenshots
- **7-inch**: 1200 x 1920 pixels minimum
- **10-inch**: 1800 x 2880 pixels minimum
- **Maximum**: 7680 x 4320 pixels (8K)

## Content Guidelines

### Best Practices
- **Show real app usage**: No mockups with device frames
- **Landscape and portrait**: Include both orientations if supported
- **Feature highlights**: Each screenshot should showcase a key feature
- **Progression**: Screenshots should tell a story about app functionality
- **No text overlays**: Avoid adding text that's not part of the app UI

### Content Restrictions
- No sexual content, violence, or hate speech
- No copyrighted material you don't own rights to
- No deceptive screenshots (showing features not in app)
- No other device manufacturers' branding

## Recommended Screenshot Sequence

1. **Main Weather Dashboard** - Current conditions and UV index
2. **Detailed Weather View** - Temperature, humidity, wind, precipitation
3. **UV Protection Recommendations** - Sunscreen advice based on UV levels
4. **Weather Forecast** - 7-day outlook with weather patterns
5. **Location Services** - Weather accuracy for current location
6. **Weather Alerts** - Severe weather notifications
7. **Settings & Themes** - Personalization options
8. **Dark/Light Mode** - Theme switching demonstration

## Screenshot Creation Methods

### Method 1: Using Android Emulator
```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd <AVD_NAME>

# Take screenshot (from emulator UI)
# Ctrl + S or use device toolbar screenshot tool

# Or using adb
adb shell screencap -p > screenshot.png
```

### Method 2: Using Development Build on Device
```bash
# Build and install
bun run android

# Take screenshots directly from device
# Power + Volume Down simultaneously
```

### Method 3: Using Maestro (Already Configured)
```bash
# Your project has Maestro configured for E2E testing
# Extend maestro/flows/ to include screenshot capture

# Run existing flow
npx maestro test maestro/flows/ios-launch.yaml

# Add screenshot capture to existing flows
```

## Screenshot Organization

### File Naming Convention
```
phone-01.png  # Main dashboard
phone-02.png  # Detailed weather view
phone-03.png  # UV recommendations
phone-04.png  # 7-day forecast
...

tablet-7inch-01.png  # 7-inch tablet screenshots
tablet-10inch-01.png # 10-inch tablet screenshots
```

### Storage Structure
```
assets/app_store/android/
├── phone/
│   ├── phone-01.png
│   ├── phone-02.png
│   └── ...
├── tablet/
│   ├── tablet-7inch-01.png
│   ├── tablet-7inch-02.png
│   ├── tablet-10inch-01.png
│   └── ...
└── screenshots-guide.md
```

## Editing and Optimization

### Recommended Tools
- **GIMP** - Free image editing with batch processing
- **Adobe Photoshop** - Professional editing and optimization
- **ImageOptim** - File size optimization without quality loss
- **TinyPNG** - Online PNG compression

### Quality Optimization
- **File size**: Keep under 5MB per screenshot
- **Compression**: Use PNG for UI elements, JPEG for photos
- **Color space**: sRGB for consistency across devices

## Automated Screenshot Generation

### Using ADB Scripting
```bash
#!/bin/bash
# screenshots.sh - Automated screenshot capture

DEVICES=$(adb devices | grep -v "List" | cut -f1)

for device in $DEVICES; do
    echo "Capturing screenshots for device: $device"
    adb -s $device shell screencap -p > "screenshot-$device-$(date +%s).png"
done
```

### Using Maestro with Screenshots
```yaml
# Extend your existing Maestro flows
- launchApp
- tapOn: "Weather"
- takeScreenshot: "weather-dashboard"
- swipe:
    direction: UP
- takeScreenshot: "forecast-view"
```

## Guidelines for Weather App Screenshots

### Weather-Specific Considerations
1. **Show Real Weather Data**: Use actual current conditions when possible
2. **Display Location**: Show accurate location services integration
3. **UV Index Focus**: Highlight the unique UV protection features
4. **Alert Examples**: Include notification screenshots if available
5. **Data Sources**: WeatherKit integration or service attribution

### Visual Consistency
- Use consistent time of day across screenshots (afternoon recommended)
- Ensure weather icons are clear and readable
- Maintain the same color scheme (light/dark mode) across all screens
- Show app navigation patterns clearly

## Submission Checklist

### Technical Requirements
- [ ] Minimum 2 phone screenshots
- [ ] Tablet screenshots if app supports tablets
- [ ] Correct dimensions (320px minimum width)
- [ ] PNG or JPEG format
- [ ] File size under 5MB each
- [ ] No device frames

### Content Requirements
- [ ] Show actual app interface
- [ ] Highlight key weather and UV features
- [ ] No false or misleading content
- [ ] Consistent branding and colors
- [ ] Professional, high-quality images

### Organization
- [ ] Screenshots properly named
- [ ] Organized by device type
- [ ] Backup copies created
- [ ] Ready for Google Play Console upload

## Quick Reference Commands

```bash
# Check connected devices
adb devices

# Take screenshot via ADB
adb shell screencap -p > screenshot.png

# Pull screenshots from device
adb pull /sdcard/Download/

# Check screenshot dimensions
file screenshot.png
# or
identify screenshot.png  # if ImageMagick installed
```

## Tips for Approval Success

1. **Show Practical Use**: Demonstrate real-world weather monitoring scenarios
2. **Highlight UV Features**: Emphasize the unique sunscreen recommendation aspect
3. **Quality over Quantity**: Better to have fewer, high-quality screenshots
4. **Test on Multiple Devices**: Ensure screenshots look good on various screen sizes
5. **Follow Material Design**: Align with Android design principles

## Common Mistakes to Avoid

- Using mockups with device frames (Google Play rejects these)
- Adding promotional text overlays outside the app
- Screenshots from different apps or concepts
- Inconsistent UI across screenshots
- Poor image quality or compression artifacts
- Missing key features that differentiate your app
