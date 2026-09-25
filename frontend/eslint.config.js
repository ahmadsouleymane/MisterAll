import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'coverage', 'src/tests']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        // Vitest globals
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Variables
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^[A-Z_]|^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],

      // Code quality
      'no-console': 'off', // Will be removed by terser in production
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['warn', 'smart'],

      // React specific
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
])
