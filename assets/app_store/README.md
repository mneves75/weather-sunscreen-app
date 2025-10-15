# Weather Sunscreen App Store Assets

This directory contains all materials needed for uploading the Weather Sunscreen app to the Apple App Store and Google Play Store.

## Directory Structure

```
assets/app_store/
├── ios/                          # iOS App Store specific assets
│   ├── screenshots-guide.md      # iOS screenshot requirements and guide
│   └── app-store-metadata.md     # iOS App Store listing metadata
├── android/                      # Google Play Store specific assets
│   ├── screenshots-guide.md      # Android screenshot requirements
│   └── google-play-metadata.md   # Google Play Store listing metadata
├── common/                       # Shared assets and documentation
│   ├── icon-graphics-specifications.md  # App icon design guidelines
│   ├── privacy-policy.md         # Privacy policy template
│   ├── terms-of-service.md       # Terms of service template
│   ├── seo-optimization-guide.md  # ASO and marketing guidelines
│   ├── release-notes-templates.md  # Version update templates
│   └── content-rating-guide.md    # Content rating guidance
└── README.md                     # This overview file
```

## Asset Categories

### 1. Screenshots (Required)
- **iOS**: Multiple device sizes (iPhone 6.7", 6.5", 5.5", iPad)
- **Android**: Phone and tablet screenshots (minimum 2 phone screenshots)
- **Guides**: Detailed requirements and creation instructions provided

### 2. App Icons (Required)
- **iOS**: 1024x1024 App Store icon + bundle icons
- **Android**: 512x512 Play Store icon + adaptive icons
- **Specifications**: Complete design and technical requirements

### 3. Metadata (Required)
- **iOS**: App name, subtitle, description, keywords, promotional text
- **Android**: App name, short description, full description, category
- **Optimization**: SEO strategies and keyword guidance

### 4. Legal Documents (Required)
- **Privacy Policy**: Comprehensive privacy protection statement
- **Terms of Service**: User agreement and app usage terms
- **URLs**: Need to be published online for app store approval

### 5. Store Listing Content (Ready to Use)
- **Content Rating**: 4+ (iOS) / Everyone (Android) - appropriate for all ages
- **Categories**: Weather (primary), Health & Fitness (iOS secondary)
- **Release Notes**: Template for current and future updates

## Quick Start Guide

### For Immediate Upload

#### Step 1: Take Screenshots
```bash
# iOS (use Fastlane for automation)
cd ios
bundle exec fastlane screenshots

# Android (manual or ADB)
adb shell screencap -p > screenshot.png
```

#### Step 2: Create App Icons
```bash
# Use existing icon generation script
bun run generate-icons
# Follow specifications in common/icon-graphics-specifications.md
```

#### Step 3: Prepare Metadata
- Copy content from `ios/app-store-metadata.md` to App Store Connect
- Copy content from `android/google-play-metadata.md` to Play Console

#### Step 4: Publish Legal Documents
- Upload `common/privacy-policy.md` to your website
- Upload `common/terms-of-service.md` to your website
- Update URLs in app store listings

### Complete Upload Process

#### iOS App Store
1. **App Store Connect Setup**
   - Create app listing using metadata from `ios/app-store-metadata.md`
   - Upload app icon following `common/icon-graphics-specifications.md`
   - Set age rating to 4+ based on `common/content-rating-guide.md`

2. **Screenshots Upload**
   - Follow `ios/screenshots-guide.md` for requirements
   - Upload to App Store Connect
   - Review optimization tips in `common/seo-optimization-guide.md`

3. **Final Submission**
   - Review all metadata for accuracy
   - Test build connects to App Store Connect
   - Submit for review

#### Google Play Store
1. **Play Console Setup**
   - Create app listing using `android/google-play-metadata.md`
   - Upload feature graphic (1024x500)
   - Set content rating to Everyone

2. **Screenshots Upload**
   - Follow `android/screenshots-guide.md` for requirements
   - Minimum 2 phone screenshots required
   - Tablet screenshots recommended

3. **Store Listing Completion**
   - Add privacy policy URL
   - Set category to "Weather"
   - Target appropriate devices

## Marketing and Optimization Resources

### SEO/ASO Strategy
- **Keyword Lists**: Comprehensive analysis in `common/seo-optimization-guide.md`
- **Competitor Analysis**: Weather app landscape insights
- **Conversion Optimization**: Screenshot and metadata testing strategies

### Release Planning
- **Version Templates**: Ready-to-use release notes in `common/release-notes-templates.md`
- **Launch Strategy**: Timeline and feature rollout recommendations
- **Update Schedule**: Ongoing content and feature planning

### Content Rating Ready
- **Pre-approved Categories**: Weather + Health & Fitness
- **Age Appropriate**: 4+ / Everyone rating with justification
- **Legal Compliant**: Privacy policy and terms ready for review

## Important Notes

### URLs to Update
Replace these placeholder URLs with your actual website URLs:
- `https://weathersunscreen.app/`
- `https://weathersunscreen.app/privacy`
- `https://weathersunscreen.app/terms`
- `https://weathersunscreen.app/support`
- `privacy@weathersunscreen.app`
- `support@weathersunscreen.app`

### Bundle and Package Identifiers
Ensure these match your application configuration:
- **iOS**: `com.mneves.weather-sunscreen-app`
- **Android**: `com.mneves.weather_sunscreen_app`

### Feature Graphic Requirements
- **Google Play**: 1024 x 500 pixels required
- **Design**: Weather + UV protection themed
- **Text**: "Weather Sunscreen - Track UV, Protect Skin"

## Support and Resources

### Technical Documentation
- Fastlane configuration in `ios/Fastfile`
- Icon generation script in `scripts/generate-icons.sh`
- Testing flows in `maestro/flows/`

### Design Resources
- Source icon: `assets/icon-liquid-glass-source.png`
- Color palette and design tokens in `src/theme/tokens.ts`
- UI components in `src/components/`

### Legal Resources
- Privacy policy drafted for global compliance
- Terms of service include platform-specific terms
- Content rating documentation with justifications

---

## Submission Checklist

### iOS App Store
- [ ] App name and subtitle configured
- [ ] Description and keywords optimized
- [ ] All required screenshots captured
- [ ] App icon (1024x1024) uploaded
- [ ] Bundle icons generated
- [ ] Privacy policy URL active
- [ ] Terms of service URL active
- [ ] Content rating set to 4+
- [ ] Category set to Weather + Health & Fitness
- [ ] Build submitted to App Store Connect

### Google Play Store
- [ ] App name configured
- [ ] Short and full descriptions written
- [ ] Minimum 2 phone screenshots uploaded
- [ ] Feature graphic (1024x500) created
- [ ] App icon (512x512) uploaded
- [ ] Adaptive icons generated
- [ ] Privacy policy URL active
- [ ] Content rating set to Everyone
- [ ] Category set to Weather
- [ ] Target devices selected
- [ ] Release created and rolled out

## Success Metrics

After launch, monitor:
- **Download velocity** and conversion rates
- **Keyword rankings** and search visibility
- **User reviews** and feedback themes
- **Store listing performance** and engagement

All materials in this directory are optimized for **Weather Sunscreen** and designed to maximize app store visibility and conversion rates.
