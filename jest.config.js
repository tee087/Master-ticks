module.exports = {
  preset: 'react-native',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-screens|react-native-safe-area-context|styled-components)/)',
  ],
  moduleNameMapper: {
    '^.+\\.(css|less|scss|png|jpg|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
};