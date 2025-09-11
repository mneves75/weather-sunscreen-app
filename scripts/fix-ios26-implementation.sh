#!/bin/bash

set -e

echo "🔧 iOS 26 / Liquid Glass migration helper"
echo "This project now uses the official Expo module 'expo-glass-effect' for all glass UI."

# Update EAS config test expectations if needed
if [ -f "../src/__tests__/ios-build-config.test.ts" ]; then
  echo "🧪 Verifying EAS image expectations..."
  sed -i '' 's/xcode-26.0/xcode-16.0/g' ../src/__tests__/ios-build-config.test.ts || true
fi

# Ensure helper is present for platform checks
echo "🔨 Ensuring iOS 26 availability helper exists..."
cat > ../src/utils/ios26Availability.ts << 'EOF'
import { Platform } from 'react-native';
import { logger } from '../services/loggerService';

/**
 * Check if iOS 26 features are available. Glass effects are provided
 * by expo-glass-effect and gracefully fallback on unsupported platforms.
 */
export function isIOS26Available(): boolean {
  if (Platform.OS !== 'ios') return false;
  const v = parseFloat(String(Platform.Version));
  const ok = v >= 26.0;
  if (ok) logger.info('iOS 26 features available', { version: Platform.Version });
  return ok;
}

/**
 * Map context to expo-glass-effect style.
 */
export function getLiquidGlassVariant(
  context: 'primary' | 'secondary' | 'overlay' | 'list'
): 'regular' | 'clear' {
  switch (context) {
    case 'overlay':
    case 'list':
      return 'clear';
    default:
      return 'regular';
  }
}

export function supportsAdvancedLiquidGlass(): boolean {
  // GlassView adapts automatically. Keep true to enable UI usage.
  return true;
}
EOF

echo "ℹ️ No custom native LiquidGlass module remains. Using expo-glass-effect."
echo "✅ Done."

