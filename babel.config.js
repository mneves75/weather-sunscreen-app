module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Enable React Compiler (default in SDK 54)
          'react-compiler': true,
          // Enable New Architecture optimizations
          newArchEnabled: true,
        },
      ],
    ],
    // Reanimated 4 uses Worklets; keep this as the last plugin
    plugins: ['react-native-worklets/plugin'],
  };
};
