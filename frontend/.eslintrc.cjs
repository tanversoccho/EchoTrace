const globals = require('globals');

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  globals: globals.browser,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:react-hooks/recommended', // React Hooks lint rules
  ],
  plugins: [
    'react-hooks',
  ],
  ignorePatterns: ['dist'], // same as globalIgnores(['dist'])
  rules: {
    'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
