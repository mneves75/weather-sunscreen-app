#!/bin/bash

# Fix CocoaPods sandbox sync issues and Xcode PIF session problems
# - Stops stale Xcode services
# - Cleans Xcode caches (DerivedData, ModuleCache, SwiftPM, Xcode cache)
# - Resets CocoaPods (deintegrate, cache clean, fresh install)

set -euo pipefail

echo "🛠️  Fixing CocoaPods/Xcode build environment (Pods + PIF)..."

# Step 0: Stop stale Xcode build services (safe; Xcode will respawn)
echo "⛔ Stopping stale Xcode/Build services (if any)..."
pkill -f 'Xcode' || true
pkill -f 'xcodebuild' || true
pkill -f 'XCBBuildService' || true
pkill -f 'XCBuild' || true
pkill -f 'SourceKit' || true
sleep 1

# Toolchain info (helpful diagnostics)
echo "🧰 Xcode toolchain:"
xcodebuild -version || true
xcode-select -p || true

# Navigate to project root (where package.json lives)
SCRIPT_DIR="$(cd -- "$(dirname "$0")" >/dev/null 2>&1 && pwd -P)"
ROOT_DIR="$SCRIPT_DIR"
if [ ! -f "$ROOT_DIR/package.json" ]; then
  # Handle if script is placed under scripts/ as well
  if [ -f "$SCRIPT_DIR/../package.json" ]; then
    ROOT_DIR="$SCRIPT_DIR/.."
  fi
fi

if [ ! -f "$ROOT_DIR/package.json" ]; then
  echo "❌ Error: Could not locate project root (package.json)." >&2
  exit 1
fi

cd "$ROOT_DIR"

if [ ! -d ios ]; then
  echo "❌ Error: iOS directory not found at '$ROOT_DIR/ios'." >&2
  exit 1
fi

cd ios
echo "📁 Working directory: $(pwd)"

# Step 1: Remove existing pods and build artifacts
echo "🧹 Cleaning existing CocoaPods installation..."
rm -rf Pods/ Podfile.lock build/

# Step 2: Clean CocoaPods cache
echo "🗑️  Cleaning CocoaPods cache..."
pod cache clean --all 2>/dev/null || echo "⚠️  Skipping CocoaPods cache clean (pod not installed)"

# Step 3: Clean Xcode caches (PIF/session related)
echo "🗑️  Cleaning Xcode DerivedData (all projects)..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

echo "🗑️  Cleaning Xcode ModuleCache.noindex..."
rm -rf ~/Library/Developer/Xcode/ModuleCache.noindex/*

echo "🗑️  Cleaning Swift Package Manager caches..."
rm -rf ~/Library/Developer/Xcode/SourcePackages/*
rm -rf ~/Library/Caches/org.swift.swiftpm/*

echo "🗑️  Cleaning Xcode general caches..."
rm -rf ~/Library/Caches/com.apple.dt.Xcode/*

echo "🧽 Removing Package.resolved files (if present)..."
find .. -name "Package.resolved" -print -exec rm -f {} \; 2>/dev/null || true

# Step 4: Clean additional caches
echo "🗑️  Cleaning other iOS build caches..."
rm -rf ~/Library/Caches/org.carthage.CarthageKit/DerivedData/ || true
rm -rf ~/Library/Caches/CocoaPods/ || true

# Step 5: Show CocoaPods version (if available)
echo "🔄 Checking CocoaPods..."
pod --version 2>/dev/null || echo "ℹ️  CocoaPods not found in PATH"

# Step 6: Deintegrate (if Podfile exists)
if [ -f "Podfile" ]; then
  echo "🔄 Deintegrating CocoaPods..."
  pod deintegrate --verbose 2>/dev/null || echo "ℹ️  No previous integration found"
  echo "📦 Installing pods..."
  pod install --verbose 2>/dev/null || echo "⚠️  Pod install will run during 'npm run ios'"
else
  echo "ℹ️  No Podfile found - pods will be set up during first iOS build"
fi

echo "✅ CocoaPods/Xcode cleanup completed successfully!"
echo "💡 Next: run 'npm run ios' to rebuild."
echo "🚀 If using Xcode, open 'ios/WeatherSunscreen.xcworkspace' and build."
