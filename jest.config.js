/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Handle React Native and Expo modules properly
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|react-native-reanimated|react-native-gesture-handler|react-native-worklets|@react-native|@react-navigation|react-clone-referenced-element|react-native-vector-icons|@react-native-async-storage|expo(|-[a-z-]+))/)',
  ],
  
  // Module mapping for React Native aliases
  moduleNameMapping: {
    '^react-native$': '<rootDir>/node_modules/react-native',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // File extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/modules/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/modules/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '/.expo/',
  ],
  
  // Coverage settings
  collectCoverage: false, // Disable for now to focus on fixing tests
  
  // Global settings
  globals: {
    __DEV__: true,
  },
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
};