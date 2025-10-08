# iOS App Store Screenshots Guide

## Required Screenshots

### iPhone/iPod touch (Required)
- **6.7-inch display**: 1290 x 2796 pixels (iPhone Pro Max)
- **6.5-inch display**: 1242 x 2688 pixels (iPhone Plus/Pro Max older)
- **5.5-inch display**: 1242 x 2208 pixels (iPhone Plus older)

### iPad (Required if app supports iPad)
- **12.9-inch display**: 2048 x 2732 pixels (iPad Pro)
- **11-inch display**: 1668 x 2388 pixels (iPad Pro)
- **10.5-inch display**: 1668 x 2224 pixels (iPad Pro)

## Screenshot Requirements

### Technical Specifications
- **Format**: PNG or JPEG (JPEG for photos, PNG for UI mockups)
- **Color space**: sRGB
- **Compression**: High quality (no visible artifacts)
- **No transparency**: No alpha channels
- **No device frames**: Clean screenshots without device bezels

### Content Guidelines
- Show app's core features and user interface
- 3-10 screenshots per device type
- First screenshot is most important (appears in search results)
- No added text overlaying images (Apple recommends clean UI)
- Consistent style across all screenshots

## Recommended Screenshot Sequence

1. **Home/Dashboard Screen** - Main weather view
2. **UV Index Screen** - UV monitoring with recommendations
3. **Forecast Screen** - Weather forecast details
4. **Settings Screen** - Theme and personalization options
5. **Notification Example** - Weather alerts feature
6. **Location-based Features** - Weather location accuracy

## Fastlane Screenshots (Already Configured)

Your project includes Fastlane configuration for automated screenshots:

```bash
# Generate screenshots automatically
cd ios
bundle exec fastlane screenshots

# This will create screenshots in:
# fastlane/screenshots/
```

### Fastlane Configuration Files
- `ios/Fastfile` - Contains screenshot capturing logic
- `ios/Snapfile` - Screenshot configuration and device list

## Manual Screenshot Creation

### Using Simulator
```bash
# Open specific simulator
open -a Simulator --args -CurrentDeviceUDID <DEVICE_UDID>

# Take screenshot
# In Simulator: File > Save Screen or Cmd+S
```
### Using Development Build
```bash
# Build and run
bun run ios -- --simulator "iPhone 16 Pro Max"

# Take screenshots from device/simulator
```

## Screenshot Editing Tools

### Recommended Tools
- **CleanShot X** - Professional screenshot editing
- **ScreenFloat** - On-screen screenshot organization
- **Sketch/Figma** - For creating UI mockups
- **Preview** - Basic editing and format conversion

### Common Edits
- Ensure all screenshots are properly sized
- Add subtle device frame if desired (Apple allows but discourages)
- Remove any status bar personal information
- Ensure consistent lighting and contrast

## File Naming Convention

```
iPhone_6_7_inch_01.png
iPhone_6_7_inch_02.png
...
iPad_12_9_inch_01.png
iPad_12_9_inch_01.png
...
```

## Submission Checklist

- [ ] All required device sizes captured
- [ ] Screenshots properly sized (check pixel dimensions)
- [ ] No transparency or alpha channels
- [ ] Consistent visual style
- [ ] App name matches App Store listing
- [ ] No prohibited content (Apple logos, etc.)
- [ ] Fastlane screens tested successfully
- [ ] Screenshots organized by device type

## Tips for Success

1. **Show the App Flow**: Screenshots should tell a story about how the app works
2. **Highlight Key Features**: Focus on weather accuracy, UV protection, and personalization
3. **Maintain Consistency**: Use same theme (light/dark) across all screenshots
4. **Avoid Text Overlays**: Let the UI speak for itself (Apple guidelines)
5. **Test on Real Devices**: Ensure screenshots look good on actual hardware

## Quick Commands

```bash
# Check current Fastlane configuration
cd ios && bundle exec fastlane lane list

# Run screenshots for all configured devices
cd ios && bundle exec fastlane screenshots

# Verify screenshot dimensions
find fastlane/screenshots -name "*.png" -exec sips -g all {} \;
```
