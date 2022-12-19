module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parserOptions: { ecmaVersion: 'latest' },
  extends: ['eslint:recommended', 'airbnb-base', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'linebreak-style': 0,
    'no-underscore-dangle': 'off',
  },
};
