module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated 4 uses Worklets; keep this as the last plugin
    plugins: ['react-native-worklets/plugin'],
  };
};
