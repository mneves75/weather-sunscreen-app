# iOS App Store Screenshots Guide

## Overview

This guide covers generating high-quality screenshots for the iOS App Store submission.

## Requirements

### Device Specifications

For iOS App Store, you need screenshots for:

1. **6.7" Display (Required)** - iPhone 16 Pro Max, iPhone 15 Pro Max, iPhone 14 Pro Max
   - Resolution: 1290 x 2796 pixels
   - Primary device for App Store

2. **6.5" Display (Optional)** - iPhone 11 Pro Max, iPhone XS Max
   - Resolution: 1242 x 2688 pixels

3. **5.5" Display (Optional)** - iPhone 8 Plus, iPhone 7 Plus
   - Resolution: 1242 x 2208 pixels

### App Store Requirements

- Minimum: 3 screenshots
- Maximum: 10 screenshots
- Format: PNG or JPG
- File size: Recommended < 500 KB per screenshot
- Orientation: Portrait (for this app)

## Quick Start

### Automated Approach

1. **Launch the app:**
   ```bash
   EXPO_IOS_SIM_DEVICE="iPhone 16 Pro Max" bun run ios
   ```

2. **Run the automated screenshot tool:**
   ```bash
   ./scripts/auto-screenshot.sh
   ```

3. **Follow the prompts** to navigate through screens and capture

### Manual Approach

1. **Launch the app:**
   ```bash
   EXPO_IOS_SIM_DEVICE="iPhone 16 Pro Max" bun run ios
   ```

2. **In the iOS Simulator:**
   - Navigate to each key screen
   - Press `Cmd+S` to save screenshot
   - Screenshots save to Desktop

3. **Move screenshots to:**
   ```
   fastlane/screenshots/ios/en-US/
   ```

### Command-line Approach

```bash
# Take screenshot of current simulator screen
xcrun simctl io booted screenshot fastlane/screenshots/ios/en-US/01-home.png

# Wait between screenshots for navigation
sleep 2

# Repeat for each screen
```

## Required Screenshots

Capture these key screens to showcase your app:

### 1. Home/Dashboard (01-home.png)
- Weather cards with liquid glass effects
- Current weather and UV index
- Location indicator
- Clean, modern iOS 26 design

### 2. UV Index Detail (02-uv-index.png)
- UV index gauge/visualization
- Sunscreen recommendations
- Protection timeline
- Liquid glass card design

### 3. 7-Day Forecast (03-forecast.png)
- Week-long weather forecast
- Temperature trends
- UV index predictions
- FlashList scrolling performance

### 4. Settings/Personalization (04-settings.png)
- Theme toggle (light/dark/high-contrast)
- Notification preferences
- Material 3 design elements
- User customization options

### Optional Screenshots

5. **Weather Details** - Detailed metrics (humidity, wind, pressure)
6. **Notifications** - Smart notification content and timing
7. **AI Insights** - Personalized recommendations
8. **Onboarding** - First-time user experience (if implemented)

## Screenshot Best Practices

### Visual Quality

1. **Use Real Data:**
   - Ensure location services are enabled
   - Use actual weather data, not mock data
   - Show realistic UV index values

2. **Showcase Key Features:**
   - Liquid glass effects on iOS 26
   - Material Design 3 components
   - Smooth animations and transitions
   - Clean typography and spacing

3. **Highlight Unique Value:**
   - UV index monitoring
   - Personalized sunscreen recommendations
   - Smart notifications
   - Beautiful, modern design

### Technical Tips

1. **Clean State:**
   - Reset simulator before capturing: `xcrun simctl erase booted`
   - Clear any test/debug data
   - Ensure proper permissions are granted

2. **Consistent Styling:**
   - Use the same theme for all screenshots (or show both light/dark)
   - Consistent status bar appearance
   - Same time/date on status bar

3. **Device Frame (Optional):**
   - Use tools like [Shotbot](https://shotbot.io) or [Screenshot.rocks](https://screenshot.rocks)
   - Add device frames for marketing appeal
   - Match background to app aesthetic

## File Organization

```
fastlane/screenshots/ios/
├── en-US/
│   ├── 01-home.png           (1290x2796)
│   ├── 02-uv-index.png       (1290x2796)
│   ├── 03-forecast.png       (1290x2796)
│   ├── 04-settings.png       (1290x2796)
│   └── ...
└── [other-locales]/
```

### Naming Convention

Use sequential numbering with descriptive names:
- `01-home.png` - First screenshot shown in App Store
- `02-uv-index.png` - Second screenshot
- `03-forecast.png` - Third screenshot
- etc.

Apple displays screenshots in alphabetical order.

## Localization

For multiple languages, create separate folders:

```
fastlane/screenshots/ios/
├── en-US/        (English)
├── es-ES/        (Spanish)
├── pt-BR/        (Portuguese - Brazil)
└── fr-FR/        (French)
```

Update `fastlane/Snapfile`:
```ruby
languages([
  "en-US",
  "es-ES",
  "pt-BR",
  "fr-FR"
])
```

## Uploading to App Store Connect

### Manual Upload

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app
3. Select version
4. Scroll to "App Store Screenshots"
5. Drag and drop PNG files for each device size
6. Add captions/descriptions (optional)
7. Save changes

### Automated Upload (Future)

Once UI tests are configured:

```bash
# Configure fastlane deliver
fastlane deliver init

# Upload screenshots
fastlane deliver --skip_binary_upload --skip_metadata
```

## Troubleshooting

### Simulator Issues

**Simulator won't boot:**
```bash
# List all simulators
xcrun simctl list devices

# Erase and reset specific simulator
xcrun simctl erase "iPhone 16 Pro Max"

# Boot manually
xcrun simctl boot "iPhone 16 Pro Max"
open -a Simulator
```

**Wrong simulator launches:**
```bash
# Set environment variable
export EXPO_IOS_SIM_DEVICE="iPhone 16 Pro Max"
bun run ios
```

### Screenshot Quality

**Blurry screenshots:**
- Ensure simulator is at 100% scale (not zoomed)
- Use PNG format, not JPG
- Capture from actual device if possible

**Wrong resolution:**
- Verify simulator device type
- Check `xcrun simctl io booted screenshot` output
- Resize with: `sips -z 2796 1290 input.png --out output.png`

### Build Failures

**CocoaPods issues:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

**Xcode build errors:**
```bash
# Clean build
rm -rf ios/build
bun run clean-ios

# Rebuild
EXPO_IOS_SIM_DEVICE="iPhone 16 Pro Max" bun run ios
```

## Tools & Resources

### Screenshot Tools
- **Simulator**: Built-in `Cmd+S` or `xcrun simctl io`
- **Shotbot**: https://shotbot.io - Device frames and backgrounds
- **Screenshot.rocks**: https://screenshot.rocks - Marketing screenshots
- **Fastlane Frameit**: https://docs.fastlane.tools/actions/frameit/

### App Store Resources
- [App Store Screenshot Specs](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications)
- [App Preview Specs](https://developer.apple.com/help/app-store-connect/reference/app-preview-specifications)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

### Design Inspiration
- [App Store Best Practices](https://developer.apple.com/app-store/product-page/)
- [iOS 26 Liquid Glass Examples](docs/REF_DOC/docs_apple/liquid-glass.md)

## Checklist

Before submission, verify:

- [ ] Screenshots captured on iPhone 16 Pro Max (6.7" display)
- [ ] Minimum 3 screenshots, maximum 10
- [ ] Correct resolution: 1290 x 2796 pixels
- [ ] PNG or JPG format
- [ ] File sizes < 500 KB each
- [ ] All screenshots show app in portrait orientation
- [ ] No personal/sensitive information visible
- [ ] Status bar shows appropriate time/battery/signal
- [ ] Consistent theme across all screenshots
- [ ] Screenshots showcase key features
- [ ] Liquid glass effects visible on iOS 26 screens
- [ ] Files named sequentially (01, 02, 03, etc.)
- [ ] Saved to `fastlane/screenshots/ios/en-US/`

## Next Steps

After generating screenshots:

1. Review all screenshots for quality and consistency
2. Add device frames if desired (using Shotbot/Screenshot.rocks)
3. Create localized versions for other languages
4. Upload to App Store Connect
5. Write compelling screenshot captions
6. Test visibility on different device sizes in App Store

## Support

For issues or questions:
- Check project documentation in `docs/`
- Review Expo SDK 54 docs: `docs/REF_DOC/docs_expo_dev/`
- Consult iOS 26 guidelines: `docs/REF_DOC/docs_apple/`
- Open GitHub issue in project repository
