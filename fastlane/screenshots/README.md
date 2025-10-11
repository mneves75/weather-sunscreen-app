# App Store Screenshots

## Directory Structure

```
screenshots/
├── ios/
│   └── en-US/
│       ├── 01-home-dashboard.png
│       ├── 02-uv-index.png
│       ├── 03-forecast.png
│       ├── 04-settings.png
│       └── ...
└── android/
    └── en-US/
        └── ...
```

## Screenshot Requirements

### iOS (6.7" Display - iPhone 16 Pro Max)

- **Expected Resolution**: 1290 x 2796 pixels (App Store standard)
- **Actual Simulator Output**: 1320 x 2868 pixels (device native resolution)
- **Format**: PNG or JPG
- **Quantity**: 3-10 screenshots
- **File Size**: < 500 KB recommended

Note: The simulator outputs screenshots at the device's native resolution (1320x2868), which is slightly different from Apple's standard screenshot size (1290x2796). App Store Connect typically accepts both, but you can resize if needed:

```bash
sips -z 2796 1290 input.png --out output.png
```

## Current Screenshots

1. **01-home-dashboard.png** - Home screen with weather cards and liquid glass effects
2. **02-uv-index.png** - UV Index detail with recommendations (to be captured)
3. **03-forecast.png** - 7-day weather forecast (to be captured)
4. **04-settings.png** - Settings and personalization (to be captured)

## Capturing Screenshots

### Quick Start

1. **Launch app on iPhone 16 Pro Max:**
   ```bash
   bun run ios:screenshots
   ```

2. **Run interactive capture tool:**
   ```bash
   bun run screenshots
   ```

3. **Or use the auto-capture tool:**
   ```bash
   bun run screenshots:auto
   ```

### Manual Capture

1. **Launch simulator:**
   ```bash
   EXPO_IOS_SIM_DEVICE="iPhone 16 Pro Max" bun run ios
   ```

2. **Navigate to each screen and press `Cmd+S` in simulator**

3. **Or use command line:**
   ```bash
   xcrun simctl io booted screenshot filename.png
   ```

## Best Practices

1. **Clean State**: Reset simulator before capturing
2. **Consistent Theme**: Use same theme for all screenshots
3. **Real Data**: Use actual location and weather data
4. **Highlight Features**: Showcase liquid glass UI, UV monitoring, and AI insights
5. **Device Frames**: Optionally add frames using Shotbot or Screenshot.rocks

## Upload to App Store

1. Log in to App Store Connect
2. Select your app and version
3. Navigate to "App Store" tab
4. Scroll to "Screenshots and Previews"
5. Upload screenshots for "6.7" display"
6. Add descriptions and save

## Troubleshooting

**Wrong resolution:**
App Store Connect may reject screenshots if resolution doesn't match. Resize with:
```bash
sips -z 2796 1290 input.png --out output.png
```

**Simulator not booting:**
```bash
xcrun simctl erase "iPhone 16 Pro Max"
xcrun simctl boot "iPhone 16 Pro Max"
```

**App not launching:**
```bash
# Clean and rebuild
bun run clean-ios
EXPO_IOS_SIM_DEVICE="iPhone 16 Pro Max" bun run ios
```

## Additional Resources

- [App Store Screenshot Specs](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications)
- [Screenshot Guidelines](../docs/APP_STORE_SCREENSHOTS.md)
- [Fastlane Documentation](https://docs.fastlane.tools/actions/snapshot/)
