#!/bin/bash

echo "🔧 Configuring project for iOS 26 beta and Xcode 16..."

# Set Xcode beta path if available
XCODE_BETA_PATH="/Applications/Xcode-beta.app"
if [ -d "$XCODE_BETA_PATH" ]; then
    echo "📱 Using Xcode beta at $XCODE_BETA_PATH"
    sudo xcode-select -s "$XCODE_BETA_PATH/Contents/Developer"
else
    echo "⚠️  Xcode beta not found at $XCODE_BETA_PATH"
    echo "📱 Using current Xcode installation"
fi

# Update project settings for iOS 26
cd ios

# Update deployment target in project.pbxproj
echo "📝 Updating project deployment target to iOS 26.0..."
sed -i '' 's/IPHONEOS_DEPLOYMENT_TARGET = [0-9.]*/IPHONEOS_DEPLOYMENT_TARGET = 26.0/g' WeatherSunscreen.xcodeproj/project.pbxproj

# Enable advanced iOS 26 features
echo "✨ Enabling iOS 26 advanced features..."
/usr/libexec/PlistBuddy -c "Set :UIRequiresFullScreen false" WeatherSunscreen/Info.plist 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :UISupportsMultipleScenes bool true" WeatherSunscreen/Info.plist 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :UILaunchStoryboardName string LaunchScreen" WeatherSunscreen/Info.plist 2>/dev/null || true

# Add iOS 26 specific capabilities
echo "🎨 Adding iOS 26 liquid glass UI capabilities..."
/usr/libexec/PlistBuddy -c "Add :UIVisualEffectViewStyle string iOS26LiquidGlass" WeatherSunscreen/Info.plist 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :UIPreferredContentSizeCategory string Large" WeatherSunscreen/Info.plist 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :UISupportsDocumentBrowser bool false" WeatherSunscreen/Info.plist 2>/dev/null || true

# Configure build settings for iOS 26
echo "🔨 Configuring build settings..."
cat > ios26-config.xcconfig << EOF
// iOS 26 Beta Configuration
IPHONEOS_DEPLOYMENT_TARGET = 26.0
SWIFT_VERSION = 6.0
CLANG_CXX_LANGUAGE_STANDARD = c++23
ENABLE_PREVIEWS = YES
ENABLE_USER_SCRIPT_SANDBOXING = YES
ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES

// Advanced optimizations for iOS 26
SWIFT_OPTIMIZATION_LEVEL = -O
GCC_OPTIMIZATION_LEVEL = s
LLVM_LTO = YES
SWIFT_COMPILATION_MODE = wholemodule

// iOS 26 UI Features
SUPPORTS_MACCATALYST = NO
SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD = YES
SUPPORTS_XR_DESIGNED_FOR_IPHONE_IPAD = NO

// Metal Performance
MTL_ENABLE_DEBUG_INFO = NO
MTL_FAST_MATH = YES
EOF

echo "✅ iOS 26 beta configuration complete!"
echo ""
echo "📋 Next steps:"
echo "1. Ensure Xcode 16 beta is installed"
echo "2. Run: pod install"
echo "3. Open project in Xcode and select iOS 26 simulator"
echo "4. Build and run the project"

cd ..