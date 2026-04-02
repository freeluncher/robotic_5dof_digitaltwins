const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/bin/**',
      '**/obj/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'warn',
    },
  },
  {
    files: ['apps/web/**/*.test.{ts,tsx}', 'apps/web/src/test/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-expressions': 'off',
    },
  },
];
