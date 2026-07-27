module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': 'warn'
  },
  ignorePatterns: [
    'node_modules',
    'babel.config.js',
    'metro.config.js',
    'jest.config.js',
    'dist',
    '.expo'
  ]
};