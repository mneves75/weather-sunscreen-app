const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// New Architecture optimizations
config.transformer = {
  ...config.transformer,
  // Enable inline requires for better performance
  inlineRequires: true,
  // Enable experimental import support (default in SDK 54)
  experimentalImportSupport: true,
};

// Enable React Compiler optimizations
config.resolver = {
  ...config.resolver,
  alias: {
    // Optimize core initialization for New Architecture
    'react-native/Libraries/Core/InitializeCore': 
      'react-native/Libraries/Core/InitializeCore.native',
  },
};

module.exports = config;
