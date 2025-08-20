#!/bin/bash
# CocoaPods Comprehensive Fix Script for Weather Sunscreen App

echo "🧹 Starting comprehensive CocoaPods cleanup for Weather Sunscreen App..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "ios" ]; then
    echo "❌ Error: This script must be run from the root of the Weather Sunscreen App project"
    exit 1
fi

cd ios

# Remove all CocoaPods artifacts
echo "📁 Removing Pods directory and lock files..."
rm -rf Pods/
rm -rf Podfile.lock
rm -rf build/
rm -rf ~/Library/Developer/Xcode/DerivedData/WeatherSunscreen-*

# Clear CocoaPods cache
echo "🗑️ Clearing CocoaPods cache..."
pod cache clean --all 2>/dev/null || echo "⚠️  CocoaPods cache clean failed (this is normal if CocoaPods is not installed)"

# Clear Xcode derived data specifically for this project
echo "🧽 Clearing Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/WeatherSunscreen-*

# Deintegrate and reinstall (only if Podfile exists)
if [ -f "Podfile" ]; then
    echo "🔄 Deintegrating CocoaPods..."
    pod deintegrate --verbose 2>/dev/null || echo "⚠️  CocoaPods deintegration skipped"
    
    echo "📦 Reinstalling CocoaPods..."
    pod install --verbose 2>/dev/null || echo "⚠️  CocoaPods installation will happen during expo run:ios"
else
    echo "ℹ️  No Podfile found - CocoaPods will be set up during first expo run:ios"
fi

cd ..

echo "✅ CocoaPods fix completed!"
echo "🔧 Next steps:"
echo "   1. Run 'npm run ios' to build and run on iOS"
echo "   2. If you encounter issues, try 'npm run clean-ios' then 'npm run ios'"