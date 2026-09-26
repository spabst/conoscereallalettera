module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: [],
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@shopify/react-native-skia)/)',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'features/**/*.js',
    'components/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
};
