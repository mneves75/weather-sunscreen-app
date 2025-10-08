# App Icons and Feature Graphics Specifications

## iOS App Icons

### Required Icon Sizes

#### App Store Icon (1024 x 1024 pixels)
- **Purpose**: App Store listing and marketing
- **Format**: PNG without transparency
- **Content**: Final app icon design
- **Notes**: Cannot contain transparency, must be rasterized

#### App Bundle Icons (Required for iOS)
```
60x60   @2x  = 120x120   iPhone,Settings,iPad Spotlight iOS 7-12
60x60   @3x  = 180x180   iPhone,Settings iOS 7-12
76x76   @2x  = 152x152   iPad iOS 7-12
83.5x83.5@2x = 167x167   iPad Pro iOS 7-12

40x40   @2x  = 80x80     iPhone,iPad Spotlight iOS 5-6
40x40   @3x  = 120x120   iPhone iOS 5-6

29x29   @2x  = 58x58     iPhone Settings,iPad Settings iOS 5-12
29x29   @3x  = 87x87     iPhone Settings iOS 5-12
20x20   @2x  = 40x40     iPhone Notifications iOS 5-12
20x20   @3x  = 60x60     iPhone Notifications iOS 5-12
```

#### iOS 14+ Widgets (Optional)
```
Small Widget  =  88x88
Medium Widget = 184x184
Large Widget  = 368x368
```

### iOS Icon Design Guidelines
- **No transparency**: Solid background required
- **No rounded corners**: iOS handles corner radius automatically
- **Clean design**: Recognizable at small sizes
- **Brand consistency**: Use app's color palette and design language
- **iOS specific**: Avoid platform-specific artifacts (no bezels, gloss)

## Android App Icons

### Required Icon Sizes

#### Google Play Store Icon (512 x 512 pixels)
- **Purpose**: Google Play Store listing
- **Format**: PNG or JPEG (32-bit PNG recommended)
- **Content**: Final app icon design
- **Notes**: No transparency allowed

#### App Bundle Icons (Required for Android)
```
mipmap-mdpi    = 48x48    (0.75x)
mipmap-hdpi    = 72x72    (1.0x)
mipmap-xhdpi   = 96x96    (1.5x)
mipmap-xxhdpi  = 144x144  (2.0x)
mipmap-xxxhdpi = 192x192  (3.0x)
mipmap-xxxxhdpi= 256x256  (4.0x) - Optional
```

#### Adaptive Icons (Android 8.0+)
```
Foreground:
- anydpi-v26 = 108x108

Background:
- anydpi-v26 = 108x108
```

### Android Icon Design Guidelines
- **Adaptive icons**: Use分层 (layer) approach for Android 8.0+
- **Material Design**: Follow Material Design 3 principles
- **Scalable**: Test on multiple densities
- **System integration**: Works well with Android theming

## Feature Graphics Specifications

### Google Play Store Feature Graphic
- **Dimensions**: 1024 x 500 pixels
- **Format**: JPG or PNG (24-bit)
- **File size**: Maximum 1MB
- **Content**: Promotional image highlighting app features

#### Feature Graphic Design Guidelines
- **Landscape orientation**: 16:9 aspect ratio
- **High contrast**: Visible on various store backgrounds
- **Brand consistency**: Use app colors and fonts
- **Clear call-to-action**: Include app name and key benefit
- **No text-heavy**: Visual focus with minimal text

### App Store Promotional Text Images
- **Dimensions**: Varies by device
- **Purpose**: App Store promotional assets
- **Content**: App screenshots and marketing materials

## Icon Creation Workflow

### Step 1: Vector Design
1. **Create vector logo** in Adobe Illustrator, Figma, or Sketch
2. **Use proper scaling**: Account for pixel grid alignment
3. **Design for small sizes**: Test at 32x32 pixels for readability
4. **Maintain visual weight**: Balance across all elements

### Step 2: Export Optimization
1. **Export main icon** at 1024x1024 (master file)
2. **Create platform variants** (iOS rounded, Android adaptive)
3. **Generate all required sizes** using automated tools or manual export
4. **Optimize file sizes** while maintaining quality

### Step 3: Quality Testing
1. **Test on actual devices**: Check visibility and recognition
2. **Multiple background testing**: Ensure visibility on light/dark
3. **Accessibility check**: Ensure sufficient contrast ratios
4. **Brand consistency review**: Compare with app UI design

## Design Principles for Weather Sunscreen App

### Icon Composition Elements
```
Sun/Sky Element: ☀️ Weather representation
Shield/Protection: 🛡️ UV/skin safety element
Weather Details: ☁️/🌧️ Additional weather indicators
Color Palette: Blue (weather) + Green (health/protection)
```

### Recommended Color Scheme
- **Primary Blue**: #2196F3 (Weather, trustworthy)
- **Health Green**: #4CAF50 (Protection, safety)
- **Accent Yellow**: #FFC107 (Sun, warnings)
- **Dark Blue**: #1976D2 (Depth, professionalism)

### Icon Concept Options

#### Option A: Sun Shield
- Central shield shape with sun rays behind
- Blue sun rays with green shield
- Clean, minimalist design
- Clear "protection from sun" messaging

#### Option B: Weather Compass
- Compass with sun and UV indicators
- Blue background with green/yellow accents
- Navigation/weather discovery concept
- Sophisticated, technical appeal

#### Option C: Split Design
- Left half: Weather elements (clouds, sun)
- Right half: Protection elements (shield, SPF)
- Diagonal or vertical division
- Clear dual-purpose messaging

## Automated Icon Generation

### Using Project Icon Generator Script
```bash
# Your project has an icon generation script
bun run generate-icons
# or
bash scripts/generate-icons.sh
```

### Manual Generation Tools
```bash
# Using ImageMagick (install with brew install imagemagick)
convert icon-1024.png -resize 180x180 ios/icon-60@3x.png
convert icon-1024.png -resize 152x152 ios/icon-76@2x.png
convert icon-1024.png -resize 144x144 android/xxhdpi/ic_launcher.png
```

### Using Figma/Sketch Export
1. **Design master icon** at 1024x1024
2. **Create export presets** for required sizes
3. **Batch export** with proper naming convention
4. **Organize by platform** in respective folders

## Asset Organization Structure

```
assets/app_store/icons/
├── ios/
│   ├── AppIcon.appiconset/
│   │   ├── Contents.json
│   │   ├── Icon-App-60x60@2x.png
│   │   ├── Icon-App-60x60@3x.png
│   │   ├── Icon-App-76x76@2x.png
│   │   ├── Icon-App-83.5x83.5@2x.png
│   │   └── ...
│   └── AppIcon-AppStore.png (1024x1024)
├── android/
│   ├── mipmap-mdpi/
│   ├── mipmap-hdpi/
│   ├── mipmap-xhdpi/
│   ├── mipmap-xxhdpi/
│   ├── mipmap-xxxhdpi/
│   ├── ic_launcher.xml
│   └── ic_launcher-adaptive.xml
├── feature-graphics/
│   ├── google-play-feature.jpg (1024x500)
│   └── app-store-promo.png
└── originals/
    ├── icon-1024.svg (vector master)
    ├── icon-1024.png (raster master)
    └── feature-graphic-source.psd
```

## Quality Assurance Checklist

### Technical Requirements
- [ ] All required sizes generated
- [ ] Correct pixel dimensions verified
- [ ] File formats appropriate (PNG for iOS, PNG/JPEG for Android)
- [ ] File sizes optimized (under platform limits)
- [ ] No transparency where prohibited

### Design Requirements
- [ ] Recognizable at small sizes (32x32 test)
- [ ] Sufficient contrast on various backgrounds
- [ ] Consistent with app UI design language
- [ ] No platform-specific artifacts
- [ ] Brand elements clearly visible

### Platform-Specific Checks
#### iOS
- [ ] App Store icon = 1024x1024, no transparency
- [ ] All bundle icons generated correctly
- [ ] Proper Contents.json files
- [ ] Vector assets converted to PNG appropriately

#### Android
- [ ] Play Store icon = 512x512, no transparency
- [ ] Adaptive icon layers properly separated
- [ ] All dpi/size variants included
- [ ] XML configuration files correct

### User Testing
- [ ] Icon recognizable in home screen context
- [ ] Distinct from competitor icons
- [ ] Conveys app purpose effectively
- [ ] Professional appearance
- [ ] No confusing or misleading elements

## Common Pitfalls to Avoid

### Design Mistakes
- Too much detail at small sizes
- Low contrast or poor color choices
- Inconsistent branding with app UI
- Platform-specific design elements
- Text that becomes unreadable when scaled

### Technical Mistakes
- Incorrect aspect ratios or dimensions
- Transparency where not allowed
- Poor image compression or artifacts
- Missing required sizes for platforms
- Improper file naming conventions

### Branding Mistakes
- Icons that don't reflect app functionality
- Similar to competitor icons
- Culturally inappropriate symbols
- Trends that quickly become dated
- Overly complex or abstract concepts

## Update and Maintenance

### When to Update Icons
- Major platform design changes (iOS/Android updates)
- Brand evolution or logo changes
- User feedback indicating recognition issues
- App functionality changes significantly
- Competitive landscape shifts

### Update Process
1. **Analyze need for change** based on user feedback or platform requirements
2. **Design new icon maintaining core brand recognition**
3. **Test across all required sizes and platforms**
4. **Prepare migration plan** for smooth transition
5. **Communicate changes** to users if significant

Remember: App icons are your most important marketing asset - invest the time to get them right!
