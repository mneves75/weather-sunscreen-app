#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$WORKSPACE_DIR/android"

export JAVA_HOME=${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}
export PATH=/opt/homebrew/opt/openjdk@17/bin:$PATH

echo "Using JAVA_HOME=$JAVA_HOME"
./gradlew assembleRelease -x lint -x test --no-daemon --console=plain

APK="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK" ]; then
  ls -lh "$APK"
  echo "✅ Android Release build succeeded"
else
  echo "❌ Android Release APK not found"
  exit 1
fi

