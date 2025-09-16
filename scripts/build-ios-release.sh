#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$WORKSPACE_DIR"

./scripts/xcode-clean.sh

SCHEME="WeatherSunscreen"
DEST_NAME="iPhone 17 Pro"

# Allow overrides:
#   DEVICE="iPhone 17 Pro Max" scripts/build-ios-release.sh
#   UDID=XXXX scripts/build-ios-release.sh
DEVICE_NAME=${DEVICE:-$DEST_NAME}
UDID=${UDID:-}

if [ -z "${UDID}" ]; then
  # Prefer an allowed UDID (from xcodebuild -showdestinations)
  UDID=$(xcodebuild -workspace ios/WeatherSunscreen.xcworkspace -scheme "$SCHEME" -showdestinations \
    | awk -F'id:' '/iPhone 17 Pro/{split($2,a,/,/);print a[1];exit}' | tr -d ' ' ) || true
fi

if [ -z "${UDID}" ]; then
  UDID=$(xcodebuild -workspace ios/WeatherSunscreen.xcworkspace -scheme "$SCHEME" -showdestinations \
    | awk -F'id:' '/iPhone 17/{split($2,a,/,/);print a[1];exit}' | tr -d ' ' ) || true
fi

if [ -z "${UDID}" ]; then
  # Fallback to name resolution
  echo "ℹ️  Falling back to device name: ${DEVICE_NAME}"
  DEST="platform=iOS Simulator,name=${DEVICE_NAME}"
else
  DEST="id=${UDID}"
fi

echo "🏗️  Building iOS Release for destination: ${DEST}"
set -o pipefail
xcodebuild -workspace ios/WeatherSunscreen.xcworkspace -scheme "$SCHEME" -destination "$DEST" -configuration Release build | tee .logs/xcodebuild-release-script.log

grep -q "\*\* BUILD SUCCEEDED \*\*" .logs/xcodebuild-release-script.log && echo "✅ iOS Release build succeeded" || { echo "❌ iOS Release build failed"; exit 1; }

