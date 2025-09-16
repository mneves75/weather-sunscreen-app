#!/usr/bin/env bash
set -euo pipefail

echo "🧹 Cleaning Xcode caches to fix PIF transfer session errors..."

DERIVED=~/Library/Developer/Xcode/DerivedData
BUILDSYS=~/Library/Developer/Xcode/BuildSystem
PKGCACHE=~/Library/Developer/Xcode/PackageCaches
SRCPKGS=~/Library/Developer/Xcode/SourcePackages

echo "🔎 DerivedData path: $DERIVED"
# Remove only our app's DerivedData to avoid nuking other projects
if compgen -G "$DERIVED/WeatherSunscreen-*" > /dev/null; then
  rm -rf "$DERIVED"/WeatherSunscreen-* || true
  echo "✅ Removed project-specific DerivedData"
else
  echo "ℹ️  No project-specific DerivedData found"
fi

# Hardened removal: clear ModuleCache contents even if files are created during deletion
if [ -d "$DERIVED/ModuleCache.noindex" ]; then
  echo "🧨 Clearing ModuleCache.noindex"
  find "$DERIVED/ModuleCache.noindex" -mindepth 1 -maxdepth 1 -exec rm -rf {} + || true
  rm -rf "$DERIVED/ModuleCache.noindex" || true
  echo "✅ Cleared ModuleCache.noindex"
fi

if [ -d "$BUILDSYS" ]; then
  rm -rf "$BUILDSYS" || true
  echo "✅ Cleared BuildSystem cache"
fi

if [ -d "$PKGCACHE" ]; then
  rm -rf "$PKGCACHE" || true
  echo "✅ Cleared PackageCaches"
fi

if [ -d "$SRCPKGS" ]; then
  rm -rf "$SRCPKGS" || true
  echo "✅ Cleared SourcePackages"
fi

echo "🧯 Stopping Simulator and stale build services (safe no-op if absent)"
pkill -f "/usr/bin/xcodebuild" || true
pkill -f Xcode\ BuildService || true
pkill -f XCBBuildService || true
xcrun simctl shutdown all || true

echo "🔧 Resolving SPM dependencies (workspace + scheme)"
# Provide scheme to avoid 'must specify a scheme' errors
xcodebuild -resolvePackageDependencies \
  -workspace ios/WeatherSunscreen.xcworkspace \
  -scheme WeatherSunscreen || true

echo "✅ Xcode cache cleanup complete. Try rebuilding now."
