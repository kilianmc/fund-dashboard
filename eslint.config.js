import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

// Flat ESLint config for this React 18 + Vite JS/JSX project (no TypeScript).
// Order matters: `eslint-config-prettier` is last so it disables any stylistic
// rules that would conflict with Prettier's formatting.
export default [
  {
    ignores: ['dist/**', 'dist-ssr/**', 'node_modules/**', '*.local'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...react.configs.recommended.rules,
      // New JSX transform: React need not be in scope for JSX.
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      // Explicitly off (also handled by jsx-runtime) for the new transform.
      'react/react-in-jsx-scope': 'off',
      // Pure JS/JSX project — no PropTypes ceremony (see CLAUDE.md).
      'react/prop-types': 'off',
    },
  },
  {
    // Node-context files: build config and standalone tooling scripts.
    files: ['*.config.js', 'scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  prettier,
];
