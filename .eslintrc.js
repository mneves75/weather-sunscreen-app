module.exports = {
  root: true,
  env: {
    es2021: true,
    browser: true,
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  settings: {
    react: { version: 'detect' },
  },
  ignorePatterns: ['node_modules/', 'android/', 'ios/', 'dist/', 'build/'],
  rules: {
    // Focus warnings on impactful issues; allow any in tests/modules via overrides
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-empty-object-type': 'warn',
    '@typescript-eslint/no-require-imports': 'off',
    'react/no-unescaped-entities': 'warn',
  },
  overrides: [
    // Node scripts (plain JS)
    {
      files: ['scripts/**/*.js', '*.config.js', 'babel.config.js', 'jest.config.js'],
      env: { node: true },
      parser: 'espree',
      plugins: [],
      extends: ['eslint:recommended', 'prettier'],
      rules: {
        'no-unused-vars': 'off',
      },
    },
    // Allow any in tests and native module shims
    {
      files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx', 'modules/**'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
