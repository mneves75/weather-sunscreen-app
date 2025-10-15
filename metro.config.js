/**
 * Metro configuration for Expo managed project with native code
 *
 * This config enables bundling JavaScript for production builds
 * without relying on the Metro dev server.
 *
 * Used for:
 * - Xcode release builds
 * - EAS builds
 * - Local .ipa generation
 */

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure paths
config.projectRoot = __dirname;
config.watchFolders = [__dirname];

// Add support for additional file extensions
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'cjs',
  'mjs',
];

// Ensure TypeScript is properly resolved
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle TypeScript aliases if needed
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
