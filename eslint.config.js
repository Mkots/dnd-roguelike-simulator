import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import pluginN from 'eslint-plugin-n'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,ts,tsx}'],
    plugins: { n: pluginN },
    rules: {
      'n/prefer-node-protocol': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'parseInt', message: 'Use Number.parseInt instead.' },
        { name: 'parseFloat', message: 'Use Number.parseFloat instead.' },
        { name: 'isNaN', message: 'Use Number.isNaN instead.' },
        { name: 'isFinite', message: 'Use Number.isFinite instead.' },
      ],
    },
  },
])
