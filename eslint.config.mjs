import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/dist/**', '**/out/**', '**/coverage/**'] },
  tseslint.configs.recommended,
  // Automatic JSX runtime: corvath compiles JSX via @vitejs/plugin-react's
  // automatic transform and does not import React in its components, so layer
  // the jsx-runtime preset on top of recommended to disable react-in-jsx-scope.
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooks.configs['recommended-latest'],
  { settings: { react: { version: 'detect' } } },
  eslintConfigPrettier,
  {
    rules: {
      // Return types are inferred throughout this app; requiring explicit
      // annotations is library-oriented noise that doesn't match the codebase.
      '@typescript-eslint/explicit-function-return-type': 'off',
      // TypeScript prop types supersede runtime PropTypes.
      'react/prop-types': 'off',
      // Raw apostrophes/quotes in JSX text render fine; escaping adds noise.
      'react/no-unescaped-entities': 'off',
      // Honour the intentional underscore-prefix "ignore me" convention.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
      ],
      // Advisory, not blocking — adding deps blindly can change effect behaviour.
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
)
