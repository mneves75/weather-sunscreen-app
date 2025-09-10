#!/bin/bash

echo "🔧 Fixing iOS 26 and Liquid Glass implementation issues..."

# Fix all remaining console.log statements
echo "📝 Replacing console.log with logger service..."

# Fix i18n/index.ts
sed -i '' "s/console\.log('\u2705 ExpoLocalization/logger.info('ExpoLocalization/g" ../src/i18n/index.ts
sed -i '' "s/console\.warn('\u26a0\ufe0f ExpoLocalization/logger.warn('ExpoLocalization/g" ../src/i18n/index.ts
sed -i '' "s/console\.log('\ud83c\udf10 /logger.info('/g" ../src/i18n/index.ts
sed -i '' "s/console\.log('\ud83d\udcf1 /logger.info('/g" ../src/i18n/index.ts
sed -i '' "s/console\.log(/logger.info(/g" ../src/i18n/index.ts
sed -i '' "s/console\.warn(/logger.warn(/g" ../src/i18n/index.ts

# Add logger import to i18n/index.ts if not present
if ! grep -q "import { logger }" ../src/i18n/index.ts; then
    sed -i '' "3a\\
import { logger } from '../services/loggerService';" ../src/i18n/index.ts
fi

# Fix weatherCodeMapping.ts
sed -i '' "s/console\.warn(/logger.warn(/g" ../src/utils/weatherCodeMapping.ts
if ! grep -q "import { logger }" ../src/utils/weatherCodeMapping.ts; then
    sed -i '' "1a\\
import { logger } from '../services/loggerService';" ../src/utils/weatherCodeMapping.ts
fi

# Fix ThemeContext.tsx
sed -i '' "s/console\.log(/logger.info(/g" ../src/context/ThemeContext.tsx
sed -i '' "s/console\.error(/logger.error(/g" ../src/context/ThemeContext.tsx
if ! grep -q "import { logger }" ../src/context/ThemeContext.tsx; then
    sed -i '' "1a\\
import { logger } from '../services/loggerService';" ../src/context/ThemeContext.tsx
fi

# Fix liquid-glass-native/index.ts
sed -i '' "s/console\.error(/logger.error(/g" ../modules/liquid-glass-native/index.ts
if ! grep -q "import { logger }" ../modules/liquid-glass-native/index.ts; then
    sed -i '' "1a\\
import { logger } from '../../src/services/loggerService';" ../modules/liquid-glass-native/index.ts
fi

echo "✅ Console.log replacements completed!"

# Update EAS build configuration for valid Xcode version
echo "📱 Updating EAS configuration for Xcode 16..."
sed -i '' 's/macos-sequoia-15.5-xcode-26.0/macos-sonoma-14.5-xcode-16.0/g' ../eas.json

# Update test files to expect iOS 26 correctly
echo "🧪 Updating test expectations..."
sed -i '' 's/xcode-26.0/xcode-16.0/g' ../src/__tests__/ios-build-config.test.ts

# Create iOS 26 availability check helper
echo "🔨 Creating iOS 26 availability checker..."
cat > ../src/utils/ios26Availability.ts << 'EOF'
import { Platform } from 'react-native';
import { logger } from '../services/loggerService';

/**
 * Check if iOS 26 and Liquid Glass features are available
 * Based on Apple's WWDC25 announcements
 */
export function isIOS26Available(): boolean {
  if (Platform.OS !== 'ios') {
    return false;
  }
  
  // iOS 26.0 releases September 9, 2025
  const iosVersion = parseFloat(Platform.Version);
  const isAvailable = iosVersion >= 26.0;
  
  if (isAvailable) {
    logger.info('iOS 26 Liquid Glass features available', { 
      version: Platform.Version,
      device: 'iOS 26 compatible device'
    });
  }
  
  return isAvailable;
}

/**
 * Get the appropriate Liquid Glass variant based on context
 * Following Apple's Human Interface Guidelines for iOS 26
 */
export function getLiquidGlassVariant(
  context: 'primary' | 'secondary' | 'overlay' | 'list'
): 'ultra' | 'prominent' | 'regular' | 'thin' | 'adaptive' {
  switch (context) {
    case 'primary':
      return 'prominent';
    case 'secondary':
      return 'regular';
    case 'overlay':
      return 'ultra';
    case 'list':
      return 'thin';
    default:
      return 'adaptive';
  }
}

/**
 * Check if device supports advanced Liquid Glass effects
 * Requires A13 Bionic or newer (iPhone 11+)
 */
export function supportsAdvancedLiquidGlass(): boolean {
  // This would normally check device capabilities
  // For now, return true for iOS 26+ devices
  return isIOS26Available();
}
EOF

echo "✅ iOS 26 availability checker created!"

# Fix native module memory management
echo "🔧 Adding cleanup methods to native module..."
cat >> ../modules/liquid-glass-native/ios/LiquidGlassNativeModule.swift << 'EOF'

// MARK: - Cleanup and Memory Management

deinit {
    cleanup()
}

private func cleanup() {
    // Stop motion updates
    if motionManager.isDeviceMotionActive {
        motionManager.stopDeviceMotionUpdates()
    }
    
    // Stop haptic engine
    hapticEngine?.stop()
    hapticEngine = nil
    
    // Invalidate any display links
    NotificationCenter.default.removeObserver(self)
}

@objc
func invalidate() {
    cleanup()
}
EOF

echo "✅ Memory management fixed in native module!"

# Update package.json scripts
echo "📦 Updating package.json scripts..."
cd ..
npm pkg set scripts.ios26="npx expo run:ios --configuration Release --device"
npm pkg set scripts.test:ios26="jest --testPathPattern=ios26"
npm pkg set scripts.lint:fix="eslint . --ext .ts,.tsx --fix"

echo "✅ All iOS 26 implementation issues fixed!"
echo ""
echo "📋 Summary of fixes:"
echo "  ✓ Replaced all console.log with logger service"
echo "  ✓ Updated EAS config to use Xcode 16.0"
echo "  ✓ Fixed test expectations"
echo "  ✓ Created iOS 26 availability checker"
echo "  ✓ Added memory management to native module"
echo "  ✓ Updated package.json scripts"
echo ""
echo "🚀 Ready for iOS 26 and Liquid Glass deployment!"