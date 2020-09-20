module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  extends: ['plugin:react/recommended', 'airbnb'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'import/prefer-default-export': 'off',
    'arrow-parens': ['error', 'as-needed'],
    'operator-linebreak': ['error', 'after'],
    'react/jsx-props-no-spreading': [
      'warn',
      {
        html: 'ignore',
      },
    ],
    'implicit-arrow-linebreak': 'off',
  },
};
