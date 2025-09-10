/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['react-native-gesture-handler/jestSetup', '<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    // Allow ESM packages used by RN & Expo ecosystem to be transformed
    'node_modules/(?!(react-native|react-native-reanimated|react-native-gesture-handler|react-native-worklets|@react-native|@react-navigation|react-clone-referenced-element|react-native-vector-icons|@react-native-async-storage|expo(|-[a-z-]+))/)',
  ],
  collectCoverage: true,
  collectCoverageFrom: ['src/components/ui/**/*.{ts,tsx}'],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: { statements: 0, branches: 0, functions: 0, lines: 0 },
    './src/components/ui/{Button,Input,ListItem,ModalSheet,Card,Skeleton}.tsx': {
      statements: 70,
      branches: 50,
      functions: 70,
      lines: 70,
    },
  },
};
